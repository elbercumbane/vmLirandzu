package com.lirandzo.service;

import com.lirandzo.entity.Encomenda;
import com.lirandzo.entity.Pagamento;
import com.lirandzo.entity.Pagamento.VerificationStatus;
import com.lirandzo.repository.ClienteRepository;
import com.lirandzo.repository.EncomendaRepository;
import com.lirandzo.repository.PagamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@Transactional
public class PagamentoService {

    @Autowired
    private PagamentoRepository pagamentoRepository;

    @Autowired
    private EncomendaRepository encomendaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ReciboService reciboService;

    private static final double VALOR_EPSILON = 0.005;

    private void emitirReciboSePagamentoConfirmado(Pagamento p) {
        if (p != null && p.getId() != null && p.getVerificationStatus() == VerificationStatus.CONFIRMED) {
            reciboService.gerarReciboSeNecessario(p.getId());
        }
    }

    public List<Pagamento> findAll() {
        return pagamentoRepository.findAllOrderedWithDetails();
    }

    public List<Pagamento> findPendentesConciliacao() {
        return pagamentoRepository.findByVerificationStatusOrderByDataPagamentoAsc(VerificationStatus.PENDING_BANK);
    }

    /** Pagamentos registados por técnico — aguardam aprovação de gestor/admin */
    public List<Pagamento> findPendentesAprovacaoGestor() {
        return pagamentoRepository.findByVerificationStatusOrderByDataPagamentoAsc(VerificationStatus.PENDING_APPROVAL);
    }

    public Optional<Pagamento> findById(Long id) {
        return pagamentoRepository.findById(id);
    }

    /**
     * Fluxo interno (ex.: {@link com.lirandzo.service.EncomendaService}) — confirma sem exigir referência de extrato.
     */
    public Pagamento save(Pagamento pagamento) {
        if (pagamento.getEncomenda() == null || pagamento.getEncomenda().getNumeroEncomenda() == null) {
            throw new IllegalArgumentException("Encomenda é obrigatória");
        }
        Long num = pagamento.getEncomenda().getNumeroEncomenda();
        Encomenda managed = encomendaRepository.findById(num)
                .orElseThrow(() -> new IllegalArgumentException("Encomenda não encontrada"));
        pagamento.setEncomenda(managed);
        if (pagamento.getVerificationStatus() == null) {
            pagamento.setVerificationStatus(VerificationStatus.CONFIRMED);
        }
        validarValorNaoExcedeTectoFactura(managed, num, pagamento.getValor(), null);
        Pagamento saved = pagamentoRepository.save(pagamento);
        recalcularValorPagoEncomenda(num);
        emitirReciboSePagamentoConfirmado(saved);
        return saved;
    }

    /**
     * Registo via API (portal de facturação): referência obrigatória, valor limitado ao que ainda cabe na factura,
     * e estado conforme perfil (técnico → sempre aguarda aprovação; admin/gestor → confirmado ou pendente banco).
     */
    public Pagamento saveFromClientRequest(Pagamento pagamento, String roleHeader) {
        if (pagamento.getEncomenda() == null || pagamento.getEncomenda().getNumeroEncomenda() == null) {
            throw new IllegalArgumentException("Encomenda é obrigatória");
        }
        Long num = pagamento.getEncomenda().getNumeroEncomenda();
        Encomenda managed = encomendaRepository.findById(num)
                .orElseThrow(() -> new IllegalArgumentException("Encomenda não encontrada"));
        pagamento.setEncomenda(managed);

        if (pagamento.getValor() == null || pagamento.getValor() <= 0) {
            throw new IllegalArgumentException("Indique um valor de pagamento válido.");
        }

        String ref = pagamento.getReferencia() != null ? pagamento.getReferencia().trim() : "";
        if (ref.isEmpty()) {
            throw new IllegalArgumentException("A referência do extrato (ou do movimento) é obrigatória.");
        }
        if (ref.length() > 100) {
            throw new IllegalArgumentException("Referência demasiado longa (máx. 100 caracteres).");
        }
        pagamento.setReferencia(ref);

        validarValorNaoExcedeTectoFactura(managed, num, pagamento.getValor(), null);

        boolean gestorOuAdmin = isGestorOuAdmin(roleHeader);
        VerificationStatus pedido = pagamento.getVerificationStatus();
        VerificationStatus resolvido = resolverEstadoInicialCliente(pedido, gestorOuAdmin);
        pagamento.setVerificationStatus(resolvido);

        Pagamento saved = pagamentoRepository.save(pagamento);
        recalcularValorPagoEncomenda(num);
        emitirReciboSePagamentoConfirmado(saved);
        return saved;
    }

    private static boolean isGestorOuAdmin(String roleHeader) {
        if (roleHeader == null || roleHeader.isBlank()) {
            return false;
        }
        String r = roleHeader.trim().toLowerCase(Locale.ROOT);
        return "admin".equals(r) || "gestor".equals(r);
    }

    /**
     * Técnico ou pedido sem cabeçalho de perfil: não confiar em CONFIRMED vindo do cliente.
     */
    private static VerificationStatus resolverEstadoInicialCliente(VerificationStatus pedido, boolean gestorOuAdmin) {
        if (!gestorOuAdmin) {
            return VerificationStatus.PENDING_APPROVAL;
        }
        if (pedido == VerificationStatus.PENDING_BANK) {
            return VerificationStatus.PENDING_BANK;
        }
        if (pedido == VerificationStatus.PENDING_APPROVAL) {
            return VerificationStatus.PENDING_APPROVAL;
        }
        if (pedido == VerificationStatus.REJECTED) {
            throw new IllegalArgumentException("Estado inválido para um novo pagamento.");
        }
        return VerificationStatus.CONFIRMED;
    }

    /** Soma valores já lançados que ainda “ocupam” o tecto da factura (tudo excepto recusados). */
    private double somaValoresNaoRecusados(Long numeroEncomenda) {
        return pagamentoRepository.findByEncomendaNumeroEncomendaOrderByIdDesc(numeroEncomenda).stream()
                .filter(p -> p.getVerificationStatus() != VerificationStatus.REJECTED)
                .mapToDouble(p -> p.getValor() != null ? p.getValor() : 0.0)
                .sum();
    }

    /**
     * Garante que o novo valor (ou alteração) não faz ultrapassar o total da encomenda.
     *
     * @param excluirPagamentoId opcional — para validar na aprovação de um registo existente
     */
    private void validarValorNaoExcedeTectoFactura(Encomenda encomenda, Long numeroEncomenda, Double valor,
                                                   Long excluirPagamentoId) {
        if (valor == null || valor <= 0) {
            throw new IllegalArgumentException("Indique um valor de pagamento válido.");
        }
        double totalFactura = encomenda.getValorTotal() != null ? encomenda.getValorTotal() : 0.0;
        double ocupado = somaValoresNaoRecusados(numeroEncomenda);
        if (excluirPagamentoId != null) {
            ocupado -= pagamentoRepository.findById(excluirPagamentoId)
                    .filter(p -> p.getVerificationStatus() != VerificationStatus.REJECTED)
                    .map(p -> p.getValor() != null ? p.getValor() : 0.0)
                    .orElse(0.0);
        }
        double restante = totalFactura - ocupado;
        if (valor > restante + VALOR_EPSILON) {
            throw new IllegalArgumentException(
                    "O valor excede o que ainda pode ser registado nesta factura (restante: "
                            + String.format(Locale.ROOT, "%.2f", Math.max(0, restante))
                            + " MZN).");
        }
    }

    public Optional<Pagamento> update(Long id, Pagamento atualizado) {
        return pagamentoRepository.findById(id)
                .map(pagamento -> {
                    pagamento.setValor(atualizado.getValor());
                    pagamento.setDataPagamento(atualizado.getDataPagamento());
                    pagamento.setReferencia(atualizado.getReferencia());
                    pagamento.setObservacoes(atualizado.getObservacoes());
                    if (atualizado.getMetodoPagamento() != null) {
                        pagamento.setMetodoPagamento(atualizado.getMetodoPagamento());
                    }
                    if (atualizado.getVerificationStatus() != null) {
                        pagamento.setVerificationStatus(atualizado.getVerificationStatus());
                    }
                    Pagamento saved = pagamentoRepository.save(pagamento);
                    recalcularValorPagoEncomenda(saved.getEncomenda().getNumeroEncomenda());
                    return saved;
                });
    }

    public void deleteById(Long id) {
        Optional<Pagamento> pagamentoOpt = pagamentoRepository.findById(id);
        if (pagamentoOpt.isEmpty()) {
            return;
        }
        Long numeroEncomenda = pagamentoOpt.get().getEncomenda().getNumeroEncomenda();
        pagamentoRepository.deleteById(id);
        recalcularValorPagoEncomenda(numeroEncomenda);
    }

    public Optional<Pagamento> confirmarConciliacao(Long id) {
        return pagamentoRepository.findById(id)
                .map(pagamento -> {
                    if (pagamento.getVerificationStatus() != VerificationStatus.PENDING_BANK) {
                        throw new IllegalStateException("Apenas pagamentos pendentes de banco podem ser confirmados.");
                    }
                    Long num = pagamento.getEncomenda().getNumeroEncomenda();
                    Encomenda enc = encomendaRepository.findById(num)
                            .orElseThrow(() -> new IllegalStateException("Encomenda não encontrada."));
                    assertSomaPagamentosNaoExcedeFactura(enc, num);
                    pagamento.setVerificationStatus(VerificationStatus.CONFIRMED);
                    Pagamento saved = pagamentoRepository.save(pagamento);
                    recalcularValorPagoEncomenda(saved.getEncomenda().getNumeroEncomenda());
                    emitirReciboSePagamentoConfirmado(saved);
                    return saved;
                });
    }

    public Optional<Pagamento> aprovarPagamentoGestor(Long id) {
        return pagamentoRepository.findById(id)
                .map(pagamento -> {
                    if (pagamento.getVerificationStatus() != VerificationStatus.PENDING_APPROVAL) {
                        throw new IllegalStateException("Apenas pagamentos em aguardo de aprovação podem ser aprovados.");
                    }
                    Long num = pagamento.getEncomenda().getNumeroEncomenda();
                    Encomenda enc = encomendaRepository.findById(num)
                            .orElseThrow(() -> new IllegalStateException("Encomenda não encontrada."));
                    assertSomaPagamentosNaoExcedeFactura(enc, num);
                    pagamento.setVerificationStatus(VerificationStatus.CONFIRMED);
                    Pagamento saved = pagamentoRepository.save(pagamento);
                    recalcularValorPagoEncomenda(saved.getEncomenda().getNumeroEncomenda());
                    emitirReciboSePagamentoConfirmado(saved);
                    return saved;
                });
    }

    private void assertSomaPagamentosNaoExcedeFactura(Encomenda enc, Long numeroEncomenda) {
        double totalFactura = enc.getValorTotal() != null ? enc.getValorTotal() : 0.0;
        double ocupado = somaValoresNaoRecusados(numeroEncomenda);
        if (ocupado > totalFactura + VALOR_EPSILON) {
            throw new IllegalStateException(
                    "A soma dos pagamentos excede o total da factura; corrija valores ou a factura antes de confirmar.");
        }
    }

    public Optional<Pagamento> recusarPagamentoGestor(Long id, String motivo) {
        return pagamentoRepository.findById(id)
                .map(pagamento -> {
                    if (pagamento.getVerificationStatus() != VerificationStatus.PENDING_APPROVAL) {
                        throw new IllegalStateException("Apenas pagamentos em aguardo de aprovação podem ser recusados.");
                    }
                    pagamento.setVerificationStatus(VerificationStatus.REJECTED);
                    String m = motivo != null && !motivo.isBlank() ? motivo.trim() : "Recusado pela gestão";
                    String obs = pagamento.getObservacoes() != null && !pagamento.getObservacoes().isBlank()
                            ? pagamento.getObservacoes() + " | [RECUSADO] " + m
                            : "[RECUSADO] " + m;
                    pagamento.setObservacoes(obs.length() > 500 ? obs.substring(0, 497) + "…" : obs);
                    Pagamento saved = pagamentoRepository.save(pagamento);
                    recalcularValorPagoEncomenda(saved.getEncomenda().getNumeroEncomenda());
                    return saved;
                });
    }

    public List<Pagamento> findByEncomendaId(Long encomendaId) {
        return pagamentoRepository.findByEncomendaNumeroEncomendaOrderByIdDesc(encomendaId);
    }

    private void recalcularValorPagoEncomenda(Long numeroEncomenda) {
        Encomenda encomenda = encomendaRepository.findById(numeroEncomenda).orElse(null);
        if (encomenda == null) {
            return;
        }
        double total = pagamentoRepository.findByEncomendaNumeroEncomendaOrderByIdDesc(numeroEncomenda).stream()
                .filter(p -> p.getVerificationStatus() == VerificationStatus.CONFIRMED)
                .mapToDouble(p -> p.getValor() != null ? p.getValor() : 0.0)
                .sum();
        encomenda.setValorPago(total);
        encomendaRepository.save(encomenda);
        atualizarEstatisticasCliente(encomenda.getCliente().getId());
    }

    private void atualizarEstatisticasCliente(Long clienteId) {
        clienteRepository.findById(clienteId).ifPresent(cliente -> {
            List<Encomenda> encomendas = encomendaRepository.findByClienteId(clienteId);

            double valorTotalFaturado = encomendas.stream()
                    .mapToDouble(e -> e.getValorTotal() != null ? e.getValorTotal() : 0.0)
                    .sum();

            double valorEmDivida = encomendas.stream()
                    .mapToDouble(e -> e.getValorDivida() != null ? e.getValorDivida() : 0.0)
                    .sum();

            cliente.setValorTotalFaturado(valorTotalFaturado);
            cliente.setValorEmDivida(valorEmDivida);
            cliente.setNumeroEncomendas(encomendas.size());

            clienteRepository.save(cliente);
        });
    }
}

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
        Pagamento saved = pagamentoRepository.save(pagamento);
        recalcularValorPagoEncomenda(num);
        return saved;
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
                    pagamento.setVerificationStatus(VerificationStatus.CONFIRMED);
                    Pagamento saved = pagamentoRepository.save(pagamento);
                    recalcularValorPagoEncomenda(saved.getEncomenda().getNumeroEncomenda());
                    return saved;
                });
    }

    public Optional<Pagamento> aprovarPagamentoGestor(Long id) {
        return pagamentoRepository.findById(id)
                .map(pagamento -> {
                    if (pagamento.getVerificationStatus() != VerificationStatus.PENDING_APPROVAL) {
                        throw new IllegalStateException("Apenas pagamentos em aguardo de aprovação podem ser aprovados.");
                    }
                    pagamento.setVerificationStatus(VerificationStatus.CONFIRMED);
                    Pagamento saved = pagamentoRepository.save(pagamento);
                    recalcularValorPagoEncomenda(saved.getEncomenda().getNumeroEncomenda());
                    return saved;
                });
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

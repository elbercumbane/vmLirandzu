package com.lirandzo.service;

import com.lirandzo.dto.EmitirFacturaCotacaoRequest;
import com.lirandzo.entity.Cliente;
import com.lirandzo.entity.Cotacao;
import com.lirandzo.entity.Cotacao.StatusCotacao;
import com.lirandzo.entity.Encomenda;
import com.lirandzo.repository.CotacaoRepository;
import com.lirandzo.repository.EncomendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional
public class FacturacaoService {

    @Autowired
    private CotacaoRepository cotacaoRepository;

    @Autowired
    private EncomendaRepository encomendaRepository;

    @Autowired
    private EncomendaService encomendaService;

    @Autowired
    private ClienteService clienteService;

    /**
     * Cria uma encomenda (factura) a partir de uma cotação aceite.
     * {@code pedido} opcional: texto de produto, rota, total e data vindos do ecrã de revisão (operador).
     */
    public Encomenda emitirFacturaDeCotacao(Long cotacaoId, EmitirFacturaCotacaoRequest pedido) {
        Cotacao cot = cotacaoRepository.findById(cotacaoId)
                .orElseThrow(() -> new IllegalArgumentException("Cotação não encontrada"));

        if (encomendaRepository.findByCotacao_Id(cotacaoId).isPresent()) {
            throw new IllegalStateException("Esta cotação já foi facturada.");
        }

        StatusCotacao st = cot.getStatus();
        if (st == StatusCotacao.CANCELLED || st == StatusCotacao.EXPIRED || st == StatusCotacao.INVOICED) {
            throw new IllegalStateException("Não é possível facturar cotações canceladas, expiradas ou já facturadas.");
        }
        // Só após confirmação pelo admin (ACCEPTED) ou aceitação registada (RESPONDED).
        if (st != StatusCotacao.RESPONDED && st != StatusCotacao.ACCEPTED) {
            throw new IllegalStateException(
                    "Só pode emitir factura depois de o administrador confirmar a cotação.");
        }

        double total = aplicarTotalFacturavel(cot, pedido);
        if (total <= 0) {
            throw new IllegalStateException("Valor total inválido. Verifique os valores antes de facturar.");
        }

        String produto = aplicarProduto(cot, pedido);
        String origem = aplicarOrigem(cot, pedido);
        String destino = aplicarDestino(cot, pedido);
        if (origem.isBlank() || destino.isBlank()) {
            throw new IllegalStateException("Origem e destino são obrigatórios na factura.");
        }
        if (produto.isBlank()) {
            throw new IllegalStateException("Descrição do produto / carga é obrigatória.");
        }
        LocalDate dataEnc = aplicarDataEncomenda(pedido);

        mergeClienteRevistoAntesDeFacturar(cot, pedido);

        Encomenda e = new Encomenda();
        e.setCliente(cot.getCliente());
        e.setProduto(produto);
        e.setOrigem(origem);
        e.setDestino(destino);
        e.setValorTotal(total);
        e.setValorPago(0.0);
        e.setCotacao(cot);
        e.setDataEncomenda(dataEnc);

        Encomenda saved = encomendaService.save(e);

        cot.setStatus(StatusCotacao.INVOICED);
        cotacaoRepository.save(cot);

        return saved;
    }

    private static double aplicarTotalFacturavel(Cotacao cot, EmitirFacturaCotacaoRequest pedido) {
        if (pedido != null && pedido.valorTotal() != null && pedido.valorTotal() > 0) {
            return pedido.valorTotal();
        }
        return calcularTotalFacturavel(cot);
    }

    private static String aplicarProduto(Cotacao cot, EmitirFacturaCotacaoRequest pedido) {
        if (pedido != null && pedido.produto() != null && !pedido.produto().isBlank()) {
            return truncar(pedido.produto().trim(), 200);
        }
        return truncar(montarDescricaoProduto(cot), 200);
    }

    private static String aplicarOrigem(Cotacao cot, EmitirFacturaCotacaoRequest pedido) {
        if (pedido != null && pedido.origem() != null && !pedido.origem().isBlank()) {
            return truncar(pedido.origem().trim(), 200);
        }
        return truncar(cot.getOrigem() != null ? cot.getOrigem() : "", 200);
    }

    private static String aplicarDestino(Cotacao cot, EmitirFacturaCotacaoRequest pedido) {
        if (pedido != null && pedido.destino() != null && !pedido.destino().isBlank()) {
            return truncar(pedido.destino().trim(), 200);
        }
        return truncar(cot.getDestino() != null ? cot.getDestino() : "", 200);
    }

    private static LocalDate aplicarDataEncomenda(EmitirFacturaCotacaoRequest pedido) {
        if (pedido != null && pedido.dataEncomenda() != null && !pedido.dataEncomenda().isBlank()) {
            try {
                return LocalDate.parse(pedido.dataEncomenda().trim());
            } catch (Exception ignored) {
                return LocalDate.now();
            }
        }
        return LocalDate.now();
    }

    private static String truncar(String s, int max) {
        if (s == null) return "";
        if (s.length() <= max) return s;
        return s.substring(0, Math.max(0, max - 3)) + "...";
    }

    /**
     * Actualiza o cliente na BD com o que o operador confirmou no ecrã (portal/cotação → factura),
     * para NUIT, morada, província e ATT aparecerem na factura e nos detalhes.
     */
    private void mergeClienteRevistoAntesDeFacturar(Cotacao cot, EmitirFacturaCotacaoRequest pedido) {
        if (pedido == null) {
            return;
        }
        Cliente ref = cot.getCliente();
        if (ref == null || ref.getId() == null) {
            return;
        }
        Cliente c = clienteService.findById(ref.getId()).orElse(ref);
        boolean changed = false;
        if (pedido.clienteNome() != null && !pedido.clienteNome().isBlank()) {
            c.setNome(truncarCampoCliente(pedido.clienteNome().trim(), 200));
            changed = true;
        }
        if (pedido.clienteTelefone() != null && !pedido.clienteTelefone().isBlank()) {
            c.setTelefone(truncarCampoCliente(pedido.clienteTelefone().trim(), 50));
            changed = true;
        }
        if (pedido.clienteEndereco() != null && !pedido.clienteEndereco().isBlank()) {
            c.setEndereco(truncarCampoCliente(pedido.clienteEndereco().trim(), 200));
            changed = true;
        }
        if (pedido.clienteNif() != null && !pedido.clienteNif().isBlank()) {
            c.setNif(truncarCampoCliente(pedido.clienteNif().trim(), 50));
            changed = true;
        }
        if (pedido.clienteProvincia() != null && !pedido.clienteProvincia().isBlank()) {
            c.setProvincia(truncarCampoCliente(pedido.clienteProvincia().trim(), 100));
            changed = true;
        }
        if (pedido.clientePessoaContacto() != null && !pedido.clientePessoaContacto().isBlank()) {
            c.setPessoaContacto(truncarCampoCliente(pedido.clientePessoaContacto().trim(), 200));
            changed = true;
        }
        if (changed) {
            clienteService.save(c);
        }
        cot.setCliente(c);
    }

    private static String truncarCampoCliente(String s, int max) {
        if (s == null || s.isEmpty()) {
            return s;
        }
        if (s.length() <= max) {
            return s;
        }
        return s.substring(0, max);
    }

    private static double calcularTotalFacturavel(Cotacao c) {
        double base = c.getValorTotal() != null ? c.getValorTotal() : 0;
        double desconto = c.getDiscountAmount() != null ? c.getDiscountAmount() : 0;
        double iva = c.getVatAmount() != null ? c.getVatAmount() : 0;
        return Math.max(0, base - desconto + iva);
    }

    private static String montarDescricaoProduto(Cotacao cot) {
        String desc = cot.getDescricaoCarga();
        if (desc != null && !desc.isBlank()) {
            String p = desc.trim();
            return p.length() > 200 ? p.substring(0, 197) + "..." : p;
        }
        String p = String.format("Transporte: %s → %s", cot.getOrigem(), cot.getDestino());
        return p.length() > 200 ? p.substring(0, 197) + "..." : p;
    }
}

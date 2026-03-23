package com.lirandzo.service;

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

    /**
     * Cria uma encomenda (factura) a partir de uma cotação enviada ao cliente,
     * gera número de factura e marca a cotação como INVOICED.
     */
    public Encomenda emitirFacturaDeCotacao(Long cotacaoId) {
        Cotacao cot = cotacaoRepository.findById(cotacaoId)
                .orElseThrow(() -> new IllegalArgumentException("Cotação não encontrada"));

        if (encomendaRepository.findByCotacao_Id(cotacaoId).isPresent()) {
            throw new IllegalStateException("Esta cotação já foi facturada.");
        }

        StatusCotacao st = cot.getStatus();
        if (st == StatusCotacao.CANCELLED || st == StatusCotacao.EXPIRED || st == StatusCotacao.INVOICED) {
            throw new IllegalStateException("Não é possível facturar cotações canceladas, expiradas ou já facturadas.");
        }
        if (st != StatusCotacao.RESPONDED && st != StatusCotacao.QUOTATION_GENERATED) {
            throw new IllegalStateException(
                    "A cotação tem de estar enviada ao cliente (respondida ou cotação gerada) antes de emitir factura.");
        }

        double total = calcularTotalFacturavel(cot);
        if (total <= 0) {
            throw new IllegalStateException("Valor total da cotação inválido. Verifique os valores antes de facturar.");
        }

        Encomenda e = new Encomenda();
        e.setCliente(cot.getCliente());
        e.setProduto(montarDescricaoProduto(cot));
        e.setOrigem(cot.getOrigem());
        e.setDestino(cot.getDestino());
        e.setValorTotal(total);
        e.setValorPago(0.0);
        e.setCotacao(cot);
        e.setDataEncomenda(LocalDate.now());

        Encomenda saved = encomendaService.save(e);

        cot.setStatus(StatusCotacao.INVOICED);
        cotacaoRepository.save(cot);

        return saved;
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

package com.lirandzo.dto;

import com.lirandzo.entity.Cliente;
import com.lirandzo.entity.Cotacao;
import com.lirandzo.entity.Encomenda;

import java.time.LocalDate;

/**
 * Vista plana para GET /encomendas/{id} — sem grafos JPA nem referências circulares na serialização JSON.
 */
public record EncomendaDetalheDTO(
        Long numeroEncomenda,
        ClienteResumoDTO cliente,
        String produto,
        String origem,
        String destino,
        Double valorTotal,
        Double valorPago,
        Double valorDivida,
        String status,
        LocalDate dataEncomenda,
        String invoiceNumber,
        LocalDate invoiceDate,
        String trackingCode,
        CotacaoResumoDTO cotacao) {

    public record ClienteResumoDTO(Long id, String nome, String telefone, String email, String endereco) {}

    public record CotacaoResumoDTO(Long id, String referencia) {}

    public static EncomendaDetalheDTO from(Encomenda e) {
        ClienteResumoDTO clienteDto = null;
        if (e.getCliente() != null) {
            Cliente c = e.getCliente();
            clienteDto = new ClienteResumoDTO(
                    c.getId(),
                    c.getNome(),
                    c.getTelefone(),
                    c.getEmail(),
                    c.getEndereco());
        }
        CotacaoResumoDTO cotDto = null;
        if (e.getCotacao() != null) {
            Cotacao cot = e.getCotacao();
            cotDto = new CotacaoResumoDTO(cot.getId(), cot.getReferencia());
        }
        return new EncomendaDetalheDTO(
                e.getNumeroEncomenda(),
                clienteDto,
                e.getProduto(),
                e.getOrigem(),
                e.getDestino(),
                e.getValorTotal(),
                e.getValorPago(),
                e.getValorDivida(),
                e.getStatus() != null ? e.getStatus().name() : null,
                e.getDataEncomenda(),
                e.getInvoiceNumber(),
                e.getInvoiceDate(),
                e.getTrackingCode(),
                cotDto);
    }
}

package com.lirandzo.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Linha temporal de rastreio de uma encomenda (factura), desde a cotação até pagamentos e viagem.
 */
public record RastreamentoTimelineDTO(
        Long numeroEncomenda,
        String trackingCode,
        String invoiceNumber,
        String referenciaCotacao,
        List<RastreamentoEventoDTO> eventos,
        int progressoPercentual) {

    public record RastreamentoEventoDTO(
            String codigo,
            String titulo,
            String detalhe,
            LocalDateTime dataOcorrencia,
            boolean concluido) {}
}

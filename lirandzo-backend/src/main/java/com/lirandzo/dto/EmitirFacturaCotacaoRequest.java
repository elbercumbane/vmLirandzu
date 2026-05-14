package com.lirandzo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Corpo opcional em POST /facturacao/cotacao/{id}/emitir.
 * Se omitido ou campos nulos, usa-se a cotação na base de dados como hoje.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record EmitirFacturaCotacaoRequest(
        String produto,
        String origem,
        String destino,
        Double valorTotal,
        /** Data da encomenda (yyyy-MM-dd). */
        String dataEncomenda,
        /** Dados do destinatário revistos no ecrã (opcional) — actualizam o cliente antes de gravar a factura. */
        String clienteNome,
        String clienteTelefone,
        String clienteEndereco,
        String clienteNif,
        String clienteProvincia,
        String clientePessoaContacto
) {}

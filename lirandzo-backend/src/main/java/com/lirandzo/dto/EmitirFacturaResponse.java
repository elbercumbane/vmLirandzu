package com.lirandzo.dto;

import java.time.LocalDate;

/** Resposta mínima após emitir factura — evita depender da serialização completa da entidade Encomenda. */
public record EmitirFacturaResponse(Long numeroEncomenda, String invoiceNumber, LocalDate invoiceDate) {}

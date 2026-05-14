package com.lirandzo.entity;

/**
 * Condição de pagamento indicada na cotação (proposta comercial).
 * Separado de {@link Cotacao#getCondicoes()} que guarda flags de fluxo interno (ex.: AJUSTE_PRECO).
 */
public enum CondicaoPagamentoCotacao {
    /** Pagamento do valor total conforme calendário acordado / à conclusão. */
    TOTALIDADE,
    /** Pagamento antecipado do valor total. */
    ADIANTADO_TOTAL,
    /** Pagamento em duas prestações. */
    DUAS_PRESTACOES,
    /** Pagamento parcial; calendário/percentagens a combinar. */
    PARCIAL
}

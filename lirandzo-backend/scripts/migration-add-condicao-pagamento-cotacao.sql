-- Condição de pagamento na cotação (PDF / proposta). Valores: TOTALIDADE, ADIANTADO_TOTAL, DUAS_PRESTACOES, PARCIAL
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(40);

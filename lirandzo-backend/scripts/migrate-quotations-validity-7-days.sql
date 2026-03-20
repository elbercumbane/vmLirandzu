-- Migração: Cotações - ajustar validade para 7 dias
-- Banco: PostgreSQL
--
-- Regra do sistema: validity_date = quotation_date + 7 days

UPDATE quotations
SET validity_date = quotation_date + 7;


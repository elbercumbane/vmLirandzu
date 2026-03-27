-- Migração: Cotações - adicionar colunas financeiras (IVA / Descontos)
-- Executar em bases de dados existentes (não faz parte do init-database.sql)

ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(15,2) DEFAULT 0.00;

ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(15,2) DEFAULT 0.00;

ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,2) DEFAULT 0.00;

ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS vat_reason VARCHAR(200) DEFAULT 'ISENTO';


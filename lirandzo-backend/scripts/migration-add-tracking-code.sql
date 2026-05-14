-- Executar em bases já existentes (produção com ddl validate) antes de deploy.
-- Hibernate com ddl-auto=update cria a coluna automaticamente em dev.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(50);
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_tracking_code ON orders(tracking_code) WHERE tracking_code IS NOT NULL;

-- Facturação: número e data da factura, ligação à cotação de origem
-- Executar em bases de dados existentes.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quotation_id BIGINT REFERENCES quotations(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_invoice_number ON orders(invoice_number) WHERE invoice_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_quotation_id ON orders(quotation_id);

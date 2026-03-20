-- Opcional: preencher números de factura para encomendas antigas (antes da migração de facturação)
-- Executar depois de migrate-orders-invoicing.sql

UPDATE orders o
SET
  invoice_number = 'FAC-' || EXTRACT(YEAR FROM COALESCE(o.order_date, o.created_at::date))::text || '-' || LPAD(o.order_number::text, 6, '0'),
  invoice_date = COALESCE(o.order_date, o.created_at::date)
WHERE o.invoice_number IS NULL;

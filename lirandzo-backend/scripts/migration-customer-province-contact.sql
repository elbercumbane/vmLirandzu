-- Campos opcionais alinhados à factura (província, pessoa de contacto)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS contact_person VARCHAR(200);

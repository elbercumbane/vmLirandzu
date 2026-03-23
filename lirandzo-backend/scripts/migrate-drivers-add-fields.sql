-- ============================================================================
-- Migração: adicionar novos campos à tabela drivers (motoristas)
-- Execute se já tem a base de dados com a estrutura antiga
--
-- psql -U postgres -d lirandzo_db -f migrate-drivers-add-fields.sql
-- ============================================================================

ALTER TABLE drivers ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS address VARCHAR(500);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS father_name VARCHAR(200);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS mother_name VARCHAR(200);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS nuit VARCHAR(20);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS id_document_number VARCHAR(50);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS phone_2 VARCHAR(50);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(200);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS license_category VARCHAR(10);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS license_issue_date DATE;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS license_expiry_date DATE;

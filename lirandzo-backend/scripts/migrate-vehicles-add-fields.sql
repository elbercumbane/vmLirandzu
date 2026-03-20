-- ============================================================================
-- Migração: adicionar novos campos à tabela vehicles (viaturas)
-- Execute se já tem a base de dados com a estrutura antiga
--
-- psql -U postgres -d lirandzo_db -f migrate-vehicles-add-fields.sql
-- ============================================================================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS chassis_number VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS capacity_unit VARCHAR(10);

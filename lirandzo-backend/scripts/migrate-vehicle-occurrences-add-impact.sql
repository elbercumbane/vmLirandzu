-- ============================================================================
-- Adicionar coluna vehicle_impact à tabela vehicle_occurrences
-- Estado da viatura após ocorrência: OPERACIONAL, EM_REPARACAO, PERDA_TOTAL
-- Actualiza automaticamente o status da viatura ao registar ocorrência.
--
-- psql -U postgres -d lirandzo_db -f migrate-vehicle-occurrences-add-impact.sql
-- ============================================================================

ALTER TABLE vehicle_occurrences
  ADD COLUMN IF NOT EXISTS vehicle_impact VARCHAR(20) NOT NULL DEFAULT 'EM_REPARACAO';

COMMENT ON COLUMN vehicle_occurrences.vehicle_impact IS 'Estado viatura após ocorrência: OPERACIONAL, EM_REPARACAO, PERDA_TOTAL';

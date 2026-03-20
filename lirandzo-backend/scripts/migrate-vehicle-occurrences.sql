-- ============================================================================
-- Criar tabela vehicle_occurrences (ocorrências de viaturas)
-- Acidentes, avarias, manutenção - quem acidentou, etc.
--
-- psql -U postgres -d lirandzo_db -f migrate-vehicle-occurrences.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS vehicle_occurrences (
    id BIGSERIAL PRIMARY KEY,
    occurrence_date DATE NOT NULL,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id BIGINT REFERENCES drivers(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    severity VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTO',
    vehicle_impact VARCHAR(20) NOT NULL DEFAULT 'EM_REPARACAO',
    estimated_cost DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicle_occurrences_vehicle ON vehicle_occurrences(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_occurrences_driver ON vehicle_occurrences(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_occurrences_date ON vehicle_occurrences(occurrence_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_occurrences_status ON vehicle_occurrences(status);

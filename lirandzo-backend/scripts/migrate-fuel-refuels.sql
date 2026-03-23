-- ============================================================================
-- Criar tabela fuel_refuels (abastecimentos)
-- Registo de abastecimentos por viatura
--
-- psql -U postgres -d lirandzo_db -f migrate-fuel-refuels.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS fuel_refuels (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    refuel_date DATE NOT NULL,
    liters DECIMAL(10,2) NOT NULL,
    cost DECIMAL(15,2) NOT NULL,
    km_reading INTEGER,
    station VARCHAR(200),
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fuel_refuels_vehicle ON fuel_refuels(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_refuels_date ON fuel_refuels(refuel_date);

COMMENT ON TABLE fuel_refuels IS 'Registo de abastecimentos por viatura';
COMMENT ON COLUMN fuel_refuels.km_reading IS 'Quilometragem no momento do abastecimento';
COMMENT ON COLUMN fuel_refuels.station IS 'Posto ou local do abastecimento';

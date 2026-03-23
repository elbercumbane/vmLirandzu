-- ============================================================================
-- Tabelas de Combustível (abastecimentos) e Manutenção
-- Módulo de Gestão de Frota
--
-- psql -U postgres -d lirandzo_db -f migrate-fuel-maintenance.sql
-- ============================================================================

-- Abastecimentos (fuel_refuels)
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

-- Manutenções (vehicle_maintenance)
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    type VARCHAR(30) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    cost DECIMAL(15,2),
    parts_replaced VARCHAR(500),
    workshop VARCHAR(200),
    km_reading INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'CONCLUIDA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_vehicle ON vehicle_maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_date ON vehicle_maintenance(maintenance_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_status ON vehicle_maintenance(status);

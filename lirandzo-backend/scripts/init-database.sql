-- ============================================================================
-- Lirandzo database initialization script
-- Creates all tables and inserts initial data (roles, users)
--
-- INSTRUCTIONS:
-- 1. Create the database first: run create-database-only.sql (connected to postgres)
-- 2. Connect to database lirandzo_db (pgAdmin, DBeaver, etc.)
-- 3. Run THIS script (init-database.sql)
--
-- Or via psql:
--   psql -U postgres -f create-database-only.sql
--   psql -U postgres -d lirandzo_db -f init-database.sql
-- ============================================================================

-- ============================================================================
-- AUTHENTICATION AND AUTHORIZATION SYSTEM
-- ============================================================================

-- Roles table (permissions)
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (login system)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,  -- BCrypt encrypted
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT true,
    account_non_expired BOOLEAN NOT NULL DEFAULT true,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT true,
    account_non_locked BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table: users and roles (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ============================================================================
-- CUSTOMERS AND ORDERS MANAGEMENT
-- ============================================================================

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    address VARCHAR(200),
    tax_id VARCHAR(50),
    total_invoiced_amount DECIMAL(15,2) DEFAULT 0.0,
    debt_amount DECIMAL(15,2) DEFAULT 0.0,
    order_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VEHICLES AND DRIVERS MANAGEMENT
-- ============================================================================

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    type VARCHAR(50),
    capacity DECIMAL(10,2),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    trip_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    license_number VARCHAR(50),
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    trip_count INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TRIPS MANAGEMENT
-- ============================================================================

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT REFERENCES drivers(id) ON DELETE SET NULL,
    vehicle_id BIGINT REFERENCES vehicles(id) ON DELETE SET NULL,
    origin VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    departure_date DATE,
    expected_arrival_date DATE,
    actual_arrival_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    fuel_consumed DECIMAL(10,2),
    fuel_cost DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ORDERS AND PAYMENTS MANAGEMENT
-- ============================================================================

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    order_number BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    product VARCHAR(200) NOT NULL,
    origin VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0.0,
    debt_amount DECIMAL(15,2) DEFAULT 0.0,
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    order_date DATE,
    trip_id BIGINT REFERENCES trips(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_number) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE,
    reference VARCHAR(100),
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Authentication indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_customers_tax_id ON customers(tax_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- Vehicle indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);

-- Driver indexes
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_name ON drivers(name);

-- Trip indexes
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_departure_date ON trips(departure_date);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_trip ON orders(trip_id);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- ============================================================================
-- QUOTATIONS MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS quotations (
    id BIGSERIAL PRIMARY KEY,
    reference VARCHAR(50) UNIQUE,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    origin VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    vehicle_type VARCHAR(100),
    cargo_description VARCHAR(500),
    total_amount DECIMAL(15,2),
    transport_cost DECIMAL(15,2),
    collection_cost DECIMAL(15,2),
    bill_of_entry_cost DECIMAL(15,2),
    quotation_date DATE,
    validity_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes VARCHAR(500),
    terms VARCHAR(500),
    operator VARCHAR(200),
    response_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_quotation_date ON quotations(quotation_date);
CREATE INDEX IF NOT EXISTS idx_quotations_reference ON quotations(reference);

-- ============================================================================
-- DELIVERY NOTES MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS delivery_notes (
    id BIGSERIAL PRIMARY KEY,
    reference VARCHAR(50) UNIQUE,
    note_date DATE,
    driver_id BIGINT REFERENCES drivers(id) ON DELETE SET NULL,
    vehicle_id BIGINT REFERENCES vehicles(id) ON DELETE SET NULL,
    trip_id BIGINT REFERENCES trips(id) ON DELETE SET NULL,
    origin VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    departure_km INTEGER,
    arrival_km INTEGER,
    distance_km INTEGER,
    total_amount DECIMAL(15,2),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_note_items (
    id BIGSERIAL PRIMARY KEY,
    delivery_note_id BIGINT NOT NULL REFERENCES delivery_notes(id) ON DELETE CASCADE,
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    order_id BIGINT REFERENCES orders(order_number) ON DELETE SET NULL,
    description VARCHAR(500) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    weight VARCHAR(50),
    note VARCHAR(200)
);

CREATE INDEX IF NOT EXISTS idx_delivery_notes_driver ON delivery_notes(driver_id);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_vehicle ON delivery_notes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_trip ON delivery_notes(trip_id);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_status ON delivery_notes(status);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_note_date ON delivery_notes(note_date);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_reference ON delivery_notes(reference);
CREATE INDEX IF NOT EXISTS idx_delivery_note_items_note ON delivery_note_items(delivery_note_id);

-- ============================================================================
-- INITIAL DATA (SEEDS)
-- ============================================================================

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('ROLE_ADMIN', 'System administrator with full access'),
    ('ROLE_MANAGER', 'Manager with complete management access'),
    ('ROLE_USER', 'Standard user with limited access')
ON CONFLICT (name) DO NOTHING;

-- Insert default users (password: admin123 for all in development)
-- BCrypt hash for "admin123": $2a$10$zBXgb379fjOVWtFpMjrCIeqILSwRf5lqx1rCTlbhLIHpuegQK82Wu
INSERT INTO users (username, password, name, email, active, account_non_expired, credentials_non_expired, account_non_locked) VALUES
    ('admin', '$2a$10$zBXgb379fjOVWtFpMjrCIeqILSwRf5lqx1rCTlbhLIHpuegQK82Wu', 'System Administrator', 'admin@lirandzo.co.mz', true, true, true, true),
    ('gestor', '$2a$10$zBXgb379fjOVWtFpMjrCIeqILSwRf5lqx1rCTlbhLIHpuegQK82Wu', 'Carlos Mondlane', 'gestor@lirandzo.co.mz', true, true, true, true),
    ('tecnico', '$2a$10$zBXgb379fjOVWtFpMjrCIeqILSwRf5lqx1rCTlbhLIHpuegQK82Wu', 'Ana Silva', 'tecnico@lirandzo.co.mz', true, true, true, true)
ON CONFLICT (username) DO NOTHING;

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'admin' AND r.name = 'ROLE_ADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'gestor' AND r.name = 'ROLE_MANAGER'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'tecnico' AND r.name = 'ROLE_USER'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================================
-- STRUCTURE NOTES
-- ============================================================================
--
-- Note: Tables may be created automatically by Hibernate when the Spring Boot
-- application starts for the first time (due to spring.jpa.hibernate.ddl-auto=update).
--
-- This SQL script is useful for:
-- 1. Creating the structure manually
-- 2. Understanding the complete database structure
-- 3. Resetting the database in development
-- 4. Manual migrations in production

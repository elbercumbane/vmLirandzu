-- ============================================================================
-- Script to create the database only (no tables)
-- Run this script first before executing init-database.sql
-- ============================================================================

-- Create database (run as superuser)
CREATE DATABASE lirandzo_db
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    TEMPLATE = template0
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

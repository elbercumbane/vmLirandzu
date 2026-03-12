-- ============================================================================
-- Script para criar apenas a base de dados (sem tabelas)
-- Execute este script primeiro antes de executar init-database.sql
-- ============================================================================

-- Criar base de dados (executar como superuser)
CREATE DATABASE lirandzo_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    TEMPLATE = template0
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

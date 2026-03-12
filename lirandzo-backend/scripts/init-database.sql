-- ============================================================================
-- Script de inicialização da base de dados Lirandzo
-- Execute este script no PostgreSQL para criar a base de dados e todas as tabelas
-- ============================================================================

-- Criar base de dados (executar como superuser)
CREATE DATABASE lirandzo_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Portuguese_Portugal.1252'
    LC_CTYPE = 'Portuguese_Portugal.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Conectar à base de dados criada
\c lirandzo_db;

-- ============================================================================
-- SISTEMA DE AUTENTICAÇÃO E AUTORIZAÇÃO
-- ============================================================================

-- Tabela de roles (papéis/permissões)
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(200),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários (sistema de login)
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Senha encriptada com BCrypt
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(50),
    ativo BOOLEAN NOT NULL DEFAULT true,
    conta_nao_expirada BOOLEAN NOT NULL DEFAULT true,
    credenciais_nao_expiradas BOOLEAN NOT NULL DEFAULT true,
    conta_nao_bloqueada BOOLEAN NOT NULL DEFAULT true,
    ultimo_login TIMESTAMP,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de junção: usuários e roles (Many-to-Many)
CREATE TABLE IF NOT EXISTS usuarios_roles (
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, role_id)
);

-- ============================================================================
-- GESTÃO DE CLIENTES E ENCOMENDAS
-- ============================================================================

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    telefone VARCHAR(50),
    email VARCHAR(100),
    endereco VARCHAR(200),
    nif VARCHAR(50),
    valor_total_faturado DECIMAL(15,2) DEFAULT 0.0,
    valor_em_divida DECIMAL(15,2) DEFAULT 0.0,
    numero_encomendas INTEGER DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- GESTÃO DE VIATURAS E MOTORISTAS
-- ============================================================================

-- Tabela de viaturas
CREATE TABLE IF NOT EXISTS viaturas (
    id BIGSERIAL PRIMARY KEY,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    tipo VARCHAR(50),
    capacidade DECIMAL(10,2),
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVA',
    numero_viagens INTEGER DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de motoristas
CREATE TABLE IF NOT EXISTS motoristas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    telefone VARCHAR(50),
    numero_carta VARCHAR(50),
    avaliacao_media DECIMAL(3,2) DEFAULT 0.0,
    numero_viagens INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- GESTÃO DE VIAGENS
-- ============================================================================

-- Tabela de viagens
CREATE TABLE IF NOT EXISTS viagens (
    id BIGSERIAL PRIMARY KEY,
    motorista_id BIGINT REFERENCES motoristas(id) ON DELETE SET NULL,
    viatura_id BIGINT REFERENCES viaturas(id) ON DELETE SET NULL,
    origem VARCHAR(200) NOT NULL,
    destino VARCHAR(200) NOT NULL,
    data_partida DATE,
    data_chegada_prevista DATE,
    data_chegada_real DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANEADA',
    combustivel_consumido DECIMAL(10,2),
    custo_combustivel DECIMAL(15,2),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- GESTÃO DE ENCOMENDAS E PAGAMENTOS
-- ============================================================================

-- Tabela de encomendas
CREATE TABLE IF NOT EXISTS encomendas (
    numero_encomenda BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    produto VARCHAR(200) NOT NULL,
    origem VARCHAR(200) NOT NULL,
    destino VARCHAR(200) NOT NULL,
    valor_total DECIMAL(15,2) NOT NULL,
    valor_pago DECIMAL(15,2) DEFAULT 0.0,
    valor_divida DECIMAL(15,2) DEFAULT 0.0,
    status VARCHAR(20) NOT NULL DEFAULT 'NAO_PAGO',
    data_encomenda DATE,
    viagem_id BIGINT REFERENCES viagens(id) ON DELETE SET NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id BIGSERIAL PRIMARY KEY,
    encomenda_id BIGINT NOT NULL REFERENCES encomendas(numero_encomenda) ON DELETE CASCADE,
    valor DECIMAL(15,2) NOT NULL,
    data_pagamento DATE,
    referencia VARCHAR(100),
    observacoes VARCHAR(500),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ÍNDICES PARA MELHORAR PERFORMANCE
-- ============================================================================

-- Índices para sistema de autenticação
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX IF NOT EXISTS idx_roles_nome ON roles(nome);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_usuario ON usuarios_roles(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_role ON usuarios_roles(role_id);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_nif ON clientes(nif);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);

-- Índices para viaturas
CREATE INDEX IF NOT EXISTS idx_viaturas_matricula ON viaturas(matricula);
CREATE INDEX IF NOT EXISTS idx_viaturas_status ON viaturas(status);

-- Índices para motoristas
CREATE INDEX IF NOT EXISTS idx_motoristas_status ON motoristas(status);
CREATE INDEX IF NOT EXISTS idx_motoristas_nome ON motoristas(nome);

-- Índices para viagens
CREATE INDEX IF NOT EXISTS idx_viagens_motorista ON viagens(motorista_id);
CREATE INDEX IF NOT EXISTS idx_viagens_viatura ON viagens(viatura_id);
CREATE INDEX IF NOT EXISTS idx_viagens_status ON viagens(status);
CREATE INDEX IF NOT EXISTS idx_viagens_data_partida ON viagens(data_partida);

-- Índices para encomendas
CREATE INDEX IF NOT EXISTS idx_encomendas_cliente ON encomendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_encomendas_status ON encomendas(status);
CREATE INDEX IF NOT EXISTS idx_encomendas_data ON encomendas(data_encomenda);
CREATE INDEX IF NOT EXISTS idx_encomendas_viagem ON encomendas(viagem_id);

-- Índices para pagamentos
CREATE INDEX IF NOT EXISTS idx_pagamentos_encomenda ON pagamentos(encomenda_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data ON pagamentos(data_pagamento);

-- ============================================================================
-- DADOS INICIAIS (SEEDS)
-- ============================================================================

-- Inserir roles padrão
INSERT INTO roles (nome, descricao) VALUES
    ('ROLE_ADMIN', 'Administrador do sistema com acesso total'),
    ('ROLE_GERENTE', 'Gerente com acesso a gestão completa'),
    ('ROLE_USER', 'Utilizador padrão com acesso limitado')
ON CONFLICT (nome) DO NOTHING;

-- Inserir usuário administrador padrão
-- Senha: admin123 (deve ser alterada após primeiro login)
-- NOTA: O hash BCrypt abaixo é um exemplo. Para gerar um hash válido:
-- 1. Use BCryptPasswordEncoder do Spring Security
-- 2. Ou crie o usuário via API após implementar autenticação
-- Hash BCrypt para "admin123" (exemplo - gerar novo hash antes de usar):
-- $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO usuarios (username, password, nome, email, ativo, conta_nao_expirada, credenciais_nao_expiradas, conta_nao_bloqueada) VALUES
    ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin@lirandzo.co.mz', true, true, true, true)
ON CONFLICT (username) DO NOTHING;

-- Associar role de admin ao usuário admin
INSERT INTO usuarios_roles (usuario_id, role_id)
SELECT u.id, r.id
FROM usuarios u, roles r
WHERE u.username = 'admin' AND r.nome = 'ROLE_ADMIN'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMENTÁRIOS SOBRE A ESTRUTURA
-- ============================================================================

-- Nota: As tabelas podem ser criadas automaticamente pelo Hibernate
-- quando a aplicação Spring Boot iniciar pela primeira vez
-- (devido à configuração spring.jpa.hibernate.ddl-auto=update)
--
-- Este script SQL é útil para:
-- 1. Criar a estrutura manualmente
-- 2. Entender a estrutura completa da base de dados
-- 3. Resetar a base de dados em desenvolvimento
-- 4. Migrações manuais em produção

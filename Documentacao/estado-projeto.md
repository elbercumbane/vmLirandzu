# Estado do Projeto Lirandzo

**Última atualização:** 2025-01-08

## Resumo Executivo

Este documento apresenta o estado atual do projeto Lirandzo, incluindo componentes implementados, configurações e pendências.

## Componentes do Projeto

### ✅ Frontend (Angular)
- **Localização:** `lirandzo-app/`
- **Status:** Implementado
- **Porta:** 4200
- **Funcionalidades:**
  - Sistema de facturação (billing)
  - Dashboard
  - Módulos de gestão

### ✅ Backend (Spring Boot)
- **Localização:** `lirandzo-backend/`
- **Status:** Implementado e configurado
- **Porta:** 8080
- **Context Path:** `/api`
- **Tecnologias:**
  - Java 17
  - Spring Boot 3.2.0
  - Spring Data JPA / Hibernate
  - PostgreSQL Driver
  - Lombok
  - Spring Security (configurado para permitir todas as requisições)

### ✅ Base de Dados (PostgreSQL)
- **Status:** Configurado
- **Nome da Base:** `lirandzo_db`
- **Porta:** 5432
- **Credenciais padrão:**
  - Username: `postgres`
  - Password: `postgres`
- **Script de inicialização:** `lirandzo-backend/scripts/init-database.sql`

### ✅ Docker
- **Status:** Configurado (2025-01-08)
- **Ficheiros:**
  - `docker-compose.yml` (raiz do projeto)
  - `lirandzo-backend/Dockerfile`
  - `lirandzo-backend/.dockerignore`
- **Serviços:**
  - PostgreSQL (postgres:15-alpine)
  - Backend Spring Boot (opcional)

## Entidades da Base de Dados

### Implementadas:
1. **Cliente** - Gestão de clientes
2. **Encomenda** - Gestão de encomendas
3. **Pagamento** - Gestão de pagamentos
4. **Viagem** - Gestão de viagens
5. **Motorista** - Gestão de motoristas
6. **Viatura** - Gestão de viaturas

## Endpoints da API

### Health Check
- `GET /api/health` - Status da API

### Clientes
- `GET /api/clientes` - Listar todos
- `GET /api/clientes/{id}` - Obter por ID
- `POST /api/clientes` - Criar novo
- `PUT /api/clientes/{id}` - Atualizar
- `DELETE /api/clientes/{id}` - Eliminar
- `GET /api/clientes/search` - Pesquisar
- `GET /api/clientes/dividas` - Listar com dívidas

### Encomendas
- `GET /api/encomendas` - Listar todas
- `GET /api/encomendas/{id}` - Obter por ID
- `POST /api/encomendas` - Criar nova
- `PUT /api/encomendas/{id}` - Atualizar
- `DELETE /api/encomendas/{id}` - Eliminar
- `GET /api/encomendas/cliente/{clienteId}` - Por cliente
- `POST /api/encomendas/{id}/pagamento` - Adicionar pagamento

## Configurações

### Ambiente de Desenvolvimento
- **Profile:** `dev`
- **Base de dados:** `localhost:5432/lirandzo_db`
- **CORS:** Habilitado para `http://localhost:4200`
- **Logging:** DEBUG ativado

### Ambiente de Produção
- **Profile:** `prod`
- **Base de dados:** Configurável via variáveis de ambiente
- **DDL Auto:** `validate` (não cria/atualiza tabelas automaticamente)
- **Logging:** WARN apenas

## Como Executar

### Opção 1: Docker Compose (Recomendado)

```bash
# Iniciar PostgreSQL
docker-compose up postgres -d

# Backend localmente
cd lirandzo-backend
mvn spring-boot:run
```

### Opção 2: Stack Completa Docker

```bash
# Iniciar tudo
docker-compose up -d
```

### Opção 3: Manual

1. Instalar PostgreSQL localmente
2. Criar base de dados: `CREATE DATABASE lirandzo_db;`
3. Executar script: `lirandzo-backend/scripts/init-database.sql`
4. Configurar credenciais em `application.properties`
5. Executar backend: `mvn spring-boot:run`

## Pendências e Melhorias Futuras

### Backend
- [ ] Implementar autenticação JWT
- [ ] Adicionar testes unitários e de integração
- [ ] Integrar Swagger/OpenAPI para documentação
- [ ] Implementar tratamento de erros global
- [ ] Adicionar migrações de base de dados (Flyway/Liquibase)
- [ ] Implementar paginação nas listagens
- [ ] Adicionar filtros avançados

### Docker
- [ ] Adicionar ficheiro `.env` para variáveis de ambiente
- [ ] Configurar volumes para logs
- [ ] Adicionar serviço para frontend Angular (opcional)
- [ ] Configurar docker-compose para produção

### Base de Dados
- [ ] Implementar backups automáticos
- [ ] Configurar replicação (produção)
- [ ] Otimizar índices baseado em uso real

## Documentação

Toda a documentação técnica está em `Documentacao/`:
- **Configuracao/** - Configurações e setup
- **Alteracoes/** - Alterações e correções
- **Funcionalidades/** - Novas funcionalidades
- **Arquitectura/** - Decisões de arquitectura

## Contactos e Suporte

Para questões técnicas, consultar a documentação em `Documentacao/` ou os READMEs em cada componente do projeto.

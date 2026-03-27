# Configuração Docker para PostgreSQL e Backend

**Data:** 2025-01-08  
**Tipo:** Configuração/Setup  
**Prioridade:** Alta

## O que foi feito

Criação de configuração Docker completa para PostgreSQL e backend Spring Boot, permitindo executar toda a stack de desenvolvimento com Docker Compose.

## Onde foi modificado

### Ficheiros criados:
- `docker-compose.yml` (raiz do projeto)
- `lirandzo-backend/Dockerfile`
- `lirandzo-backend/.dockerignore`

### Ficheiros existentes utilizados:
- `lirandzo-backend/scripts/init-database.sql` (montado como volume no container)

## Porquê foi modificado

**Problema identificado:**
- O projeto tinha configuração do backend e PostgreSQL, mas não tinha Docker configurado
- Era necessário instalar PostgreSQL localmente para desenvolvimento
- Não havia forma padronizada de executar a base de dados

**Solução:**
- Criar docker-compose.yml para facilitar o setup
- Permitir que qualquer desenvolvedor execute `docker-compose up` e tenha tudo funcionando
- Isolar o ambiente de desenvolvimento

## Como foi implementado

### 1. Docker Compose (`docker-compose.yml`)

Criado serviço PostgreSQL com:
- **Imagem:** `postgres:15-alpine` (leve e estável)
- **Porta:** 5432 (mapeada para host)
- **Variáveis de ambiente:**
  - `POSTGRES_DB: lirandzo_db`
  - `POSTGRES_USER: postgres`
  - `POSTGRES_PASSWORD: postgres`
- **Volumes:**
  - Volume persistente `postgres_data` para dados
  - Script SQL de inicialização montado em `/docker-entrypoint-initdb.d/`
- **Healthcheck:** Verifica se PostgreSQL está pronto antes de iniciar dependentes
- **Rede:** Rede isolada `lirandzo-network`

Criado serviço Backend (opcional):
- **Build:** Usa Dockerfile do backend
- **Porta:** 8080
- **Dependências:** Aguarda PostgreSQL estar saudável
- **Variáveis de ambiente:** Configuração Spring Boot para conectar ao PostgreSQL no container

### 2. Dockerfile do Backend (`lirandzo-backend/Dockerfile`)

**Multi-stage build:**
- **Stage 1 (Build):** Usa `maven:3.9-eclipse-temurin-17`
  - Copia `pom.xml` e faz download de dependências (cache layer)
  - Copia código fonte
  - Executa `mvn clean package`
- **Stage 2 (Runtime):** Usa `eclipse-temurin:17-jre-alpine`
  - Imagem JRE apenas (menor tamanho)
  - Cria utilizador não-root para segurança
  - Copia JAR do stage de build
  - Healthcheck configurado para `/api/health`
  - Expõe porta 8080

### 3. .dockerignore (`lirandzo-backend/.dockerignore`)

Ignora ficheiros desnecessários no build:
- `target/` (será gerado no build)
- `.git/`, `.idea/`, `*.iml` (IDE files)
- `*.log` (logs)
- `node_modules/` (se houver)

## Como usar

### Opção 1: Apenas PostgreSQL (recomendado para desenvolvimento local)

```bash
# Iniciar apenas PostgreSQL
docker-compose up postgres -d

# O backend pode correr localmente com:
cd lirandzo-backend
mvn spring-boot:run
```

### Opção 2: Stack completa (PostgreSQL + Backend)

```bash
# Iniciar tudo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Parar e remover volumes (apaga dados)
docker-compose down -v
```

### Verificar se está funcionando

```bash
# Verificar containers
docker-compose ps

# Verificar logs do PostgreSQL
docker-compose logs postgres

# Verificar logs do backend
docker-compose logs backend

# Testar conexão PostgreSQL
docker-compose exec postgres psql -U postgres -d lirandzo_db -c "SELECT version();"

# Testar API backend
curl http://localhost:8080/api/health
```

## Configuração do Backend

O backend precisa estar configurado para conectar ao PostgreSQL no Docker:

**Para desenvolvimento local (backend fora do Docker):**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/lirandzo_db
```

**Para backend no Docker:**
```properties
spring.datasource.url=jdbc:postgresql://postgres:5432/lirandzo_db
```

O docker-compose.yml já configura automaticamente quando o backend roda no Docker.

## Impacto

### Antes:
- Necessário instalar PostgreSQL localmente
- Configuração manual da base de dados
- Diferenças entre ambientes de desenvolvimento

### Depois:
- Setup consistente com um comando
- Isolamento de ambiente
- Fácil reset da base de dados (`docker-compose down -v`)
- Portabilidade entre máquinas

## Próximos passos

- [ ] Adicionar variáveis de ambiente via `.env` file
- [ ] Configurar volumes para logs
- [ ] Adicionar serviço para frontend Angular (opcional)
- [ ] Configurar docker-compose para produção

## Referências

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)

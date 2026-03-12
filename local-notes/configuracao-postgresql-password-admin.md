# Configuração PostgreSQL - Password "admin"

**Data:** 2025-01-08  
**Tipo:** Configuração  
**Prioridade:** Alta

## O que foi feito

1. ✅ Atualizada password para "admin" em todos os ficheiros de configuração
2. ✅ Criados scripts PowerShell para configuração automática
3. ✅ Criados scripts SQL separados para criação de base de dados e tabelas
4. ✅ Verificado que PostgreSQL está instalado e rodando (serviço: postgresql-x64-16)

## Ficheiros Modificados

### Configuração de Password Atualizada:

- `docker-compose.yml` - POSTGRES_PASSWORD e SPRING_DATASOURCE_PASSWORD alterados para "admin"
- `lirandzo-backend/src/main/resources/application.properties` - spring.datasource.password = "admin"
- `lirandzo-backend/src/main/resources/application-dev.properties` - spring.datasource.password = "admin"
- `lirandzo-backend/src/main/resources/application-prod.properties` - DB_PASSWORD default = "admin"

### Scripts Criados:

- `scripts/configurar-postgresql.ps1` - Script completo para verificar/instalar e configurar PostgreSQL
- `scripts/setup-database.ps1` - Script simplificado para configurar password e criar base de dados
- `lirandzo-backend/scripts/create-database-only.sql` - Script SQL para criar apenas a base de dados
- `lirandzo-backend/scripts/create-tables-only.sql` - Script SQL para criar apenas as tabelas (sem comando \c)

## Status Atual

- ✅ PostgreSQL instalado: PostgreSQL 16 (serviço: postgresql-x64-16)
- ✅ Serviço PostgreSQL rodando
- ⚠️ Password ainda não configurada para "admin" (requer configuração manual)
- ⚠️ Base de dados ainda não criada

## Como Configurar

### Passo 1: Configurar Password do PostgreSQL

A password atual do PostgreSQL não é "admin". Para configurar:

**Opção A: Via psql (Recomendado)**

```powershell
# Abrir PowerShell e executar:
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432

# No prompt do psql, executar:
ALTER USER postgres WITH PASSWORD 'admin';
\q
```

**Opção B: Via script SQL**

```powershell
# Criar ficheiro alter-password.sql com conteúdo:
# ALTER USER postgres WITH PASSWORD 'admin';

# Executar:
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -f alter-password.sql
```

**Nota:** Se pedir password, use a password atual do PostgreSQL (pode ser a que foi definida durante a instalação).

### Passo 2: Criar Base de Dados

Após configurar a password, execute:

```powershell
$env:PGPASSWORD = "admin"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -f "lirandzo-backend\scripts\create-database-only.sql"
```

Ou execute diretamente:

```powershell
$env:PGPASSWORD = "admin"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -c "CREATE DATABASE lirandzo_db WITH OWNER = postgres ENCODING = 'UTF8';"
```

### Passo 3: Criar Tabelas

```powershell
$env:PGPASSWORD = "admin"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -d lirandzo_db -f "lirandzo-backend\scripts\create-tables-only.sql"
```

### Passo 4: Verificar

```powershell
$env:PGPASSWORD = "admin"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -d lirandzo_db -c "\dt"
```

Deve mostrar todas as tabelas criadas:
- roles
- usuarios
- usuarios_roles
- clientes
- viaturas
- motoristas
- viagens
- encomendas
- pagamentos

## Script Automático

Para executar tudo de uma vez (após configurar password manualmente):

```powershell
cd "C:\Users\Elber Elizio\Desktop\DAP PROJECTOS\vmLirandzu"
.\scripts\setup-database.ps1
```

## Configuração Final

Após concluir todos os passos:

- **Usuário:** postgres
- **Password:** admin
- **Base de dados:** lirandzo_db
- **Porta:** 5432 (local) ou 5433 (Docker)
- **Host:** localhost

## Troubleshooting

### Erro: "password authentication failed"

**Causa:** Password ainda não foi alterada para "admin"

**Solução:** Execute o Passo 1 acima para configurar a password

### Erro: "database already exists"

**Causa:** Base de dados já foi criada anteriormente

**Solução:** Pode ignorar ou remover e recriar:
```sql
DROP DATABASE lirandzo_db;
CREATE DATABASE lirandzo_db;
```

### Erro: "relation already exists"

**Causa:** Tabelas já foram criadas

**Solução:** Pode ignorar (script usa CREATE TABLE IF NOT EXISTS) ou remover tabelas:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

### PostgreSQL não encontrado no PATH

**Solução:** Use o caminho completo:
```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```

Ou adicione ao PATH:
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
```

## Próximos Passos

Após configurar tudo:

1. ✅ Verificar conexão do backend com PostgreSQL
2. ✅ Testar endpoints da API
3. ✅ Verificar se Hibernate cria/atualiza tabelas automaticamente (se configurado)

## Notas

- A password "admin" é para desenvolvimento. Em produção, use senhas fortes.
- O script `init-database.sql` original contém comando `\c` que não funciona em SQL puro, por isso foram criados scripts separados.
- Se usar Docker, a password já está configurada no `docker-compose.yml`.

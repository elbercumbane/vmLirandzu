# Verificação Final: Configuração PostgreSQL

**Data:** 2025-01-08  
**Tipo:** Verificação/Troubleshooting  
**Prioridade:** Crítica

## Status Atual

### Configuração Correta:

1. **Docker Compose:**
   - Porta: `5433:5432` (host:container)
   - Senha: `admin123`
   - Container: `lirandzo-postgres`

2. **Application Properties:**
   - `application.properties`: `localhost:5433`
   - `application-dev.properties`: `localhost:5433`
   - `application-prod.properties`: `localhost:5433` (default)
   - Senha: `admin123` em todos

3. **Container:**
   - Rodando e saudável
   - Base de dados `lirandzo_db` existe
   - Usuário `postgres` com senha `admin123`

## Comandos de Verificação

### 1. Verificar Container

```bash
docker ps | grep lirandzo-postgres
```

**Esperado:** Container rodando na porta `0.0.0.0:5433->5432/tcp`

### 2. Verificar Porta

```bash
netstat -ano | findstr :5433
```

**Esperado:** Porta 5433 em LISTENING

### 3. Verificar Configuração

```bash
# Verificar application-dev.properties
Get-Content lirandzo-backend\src\main\resources\application-dev.properties | Select-String -Pattern "url|password"
```

**Esperado:**
```
spring.datasource.url=jdbc:postgresql://localhost:5433/lirandzo_db
spring.datasource.password=admin123
```

### 4. Testar Conexão Docker

```bash
docker exec lirandzo-postgres psql -U postgres -d lirandzo_db -c "SELECT 1;"
```

**Esperado:** Retorna `1` sem erros

### 5. Limpar Cache e Recompilar

```bash
cd lirandzo-backend
mvn clean
mvn compile
```

### 6. Verificar Variáveis de Ambiente

```bash
# Limpar variáveis que possam sobrescrever
$env:SPRING_DATASOURCE_URL=""
$env:SPRING_DATASOURCE_PASSWORD=""
$env:SPRING_DATASOURCE_USERNAME=""
```

## Se Ainda Não Funcionar

### Opção 1: Verificar Logs Detalhados

Adicionar ao `application-dev.properties`:

```properties
logging.level.org.springframework.boot.autoconfigure.jdbc.DataSourceProperties=DEBUG
logging.level.com.zaxxer.hikari=DEBUG
```

Isso mostrará exatamente qual URL e senha o Spring Boot está a usar.

### Opção 2: Testar Conexão Manual

Se tiver `psql` instalado localmente:

```bash
psql -h localhost -p 5433 -U postgres -d lirandzo_db
# Senha: admin123
```

### Opção 3: Recriar Tudo

```bash
# 1. Parar e remover
docker-compose down -v

# 2. Limpar cache Maven
cd lirandzo-backend
mvn clean

# 3. Recriar container
cd ..
docker-compose up postgres -d

# 4. Aguardar inicialização (10-15 segundos)
Start-Sleep -Seconds 15

# 5. Verificar
docker exec lirandzo-postgres psql -U postgres -d lirandzo_db -c "SELECT 1;"

# 6. Iniciar backend
cd lirandzo-backend
mvn spring-boot:run
```

## Checklist Final

Antes de iniciar o backend, verificar:

- [ ] Container Docker rodando (`docker ps`)
- [ ] Porta 5433 acessível (`netstat -ano | findstr :5433`)
- [ ] Ficheiros de configuração com porta 5433
- [ ] Ficheiros de configuração com senha admin123
- [ ] Cache Maven limpo (`mvn clean`)
- [ ] Variáveis de ambiente limpas
- [ ] Conexão Docker funciona (`docker exec ... psql`)

## Próximos Passos

1. Executar todos os comandos de verificação acima
2. Se tudo estiver correto, iniciar backend:
   ```bash
   cd lirandzo-backend
   mvn spring-boot:run
   ```
3. Verificar logs para confirmar conexão bem-sucedida
4. Se erro persistir, verificar logs detalhados com DEBUG habilitado

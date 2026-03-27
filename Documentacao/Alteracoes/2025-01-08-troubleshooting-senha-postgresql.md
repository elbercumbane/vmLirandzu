# Troubleshooting: Erro de Autenticação PostgreSQL

**Data:** 2025-01-08  
**Tipo:** Troubleshooting  
**Prioridade:** Alta

## Erro

```
FATAL: password authentication failed for user "postgres"
```

## Diagnóstico

### 1. Verificar Configuração nos Ficheiros

**docker-compose.yml:**
```yaml
POSTGRES_PASSWORD: admin123
```

**application.properties:**
```properties
spring.datasource.password=admin123
```

**application-dev.properties:**
```properties
spring.datasource.password=admin123
```

### 2. Verificar se Container Está com Senha Correta

```bash
# Verificar variáveis de ambiente do container
docker inspect lirandzo-postgres | grep POSTGRES_PASSWORD

# Testar conexão direta
docker exec lirandzo-postgres psql -U postgres -d lirandzo_db -c "SELECT 1;"
```

### 3. Problemas Comuns e Soluções

#### Problema 1: Volume Antigo com Senha Diferente

**Sintoma:** Container recriado mas ainda com senha antiga

**Solução:**
```bash
# Remover volume completamente
docker-compose down -v

# Recriar
docker-compose up postgres -d
```

#### Problema 2: Cache do Spring Boot

**Sintoma:** Ficheiros corretos mas Spring Boot usa senha antiga

**Solução:**
```bash
cd lirandzo-backend
mvn clean
mvn spring-boot:run
```

#### Problema 3: Profile Incorreto

**Sintoma:** Spring Boot lê application.properties em vez de application-dev.properties

**Verificar:**
```bash
# Ver qual profile está ativo nos logs
# Deve mostrar: "The following 1 profile is active: "dev""
```

**Solução:** Garantir que `application.properties` tem:
```properties
spring.profiles.active=dev
```

#### Problema 4: Container Não Recriado Após Mudança

**Sintoma:** docker-compose.yml atualizado mas container antigo ainda rodando

**Solução:**
```bash
# Forçar recriação
docker-compose down
docker-compose up postgres -d --force-recreate
```

## Solução Completa (Passo a Passo)

### Passo 1: Parar e Remover Tudo

```bash
# Na raiz do projeto
docker-compose down -v
```

### Passo 2: Limpar Cache do Maven

```bash
cd lirandzo-backend
mvn clean
```

### Passo 3: Verificar Ficheiros de Configuração

**Verificar docker-compose.yml:**
```yaml
POSTGRES_PASSWORD: admin123  # Deve ser admin123
```

**Verificar application-dev.properties:**
```properties
spring.datasource.password=admin123  # Deve ser admin123
```

### Passo 4: Recriar Container

```bash
# Na raiz do projeto
docker-compose up postgres -d

# Aguardar inicialização (10-15 segundos)
```

### Passo 5: Verificar Conexão

```bash
# Testar conexão direta
docker exec lirandzo-postgres psql -U postgres -d lirandzo_db -c "SELECT 1;"
```

### Passo 6: Iniciar Backend

```bash
cd lirandzo-backend
mvn spring-boot:run
```

## Verificação Final

Após seguir todos os passos, verificar:

1. **Container rodando:**
   ```bash
   docker-compose ps
   ```

2. **Senha correta no container:**
   ```bash
   docker inspect lirandzo-postgres | grep POSTGRES_PASSWORD
   ```

3. **Backend conecta:**
   - Ver logs do Spring Boot
   - Não deve aparecer erro de autenticação
   - Deve mostrar "HikariPool-1 - Start completed"

## Comandos de Diagnóstico Rápido

```bash
# 1. Verificar senha no docker-compose
cat docker-compose.yml | grep POSTGRES_PASSWORD

# 2. Verificar senha no application-dev.properties
cat lirandzo-backend/src/main/resources/application-dev.properties | grep password

# 3. Verificar se container está rodando
docker-compose ps postgres

# 4. Testar conexão
docker exec lirandzo-postgres psql -U postgres -d lirandzo_db -c "SELECT version();"

# 5. Ver logs do container
docker-compose logs postgres | tail -20
```

## Se Ainda Não Funcionar

1. **Verificar se há PostgreSQL local rodando na porta 5432:**
   ```bash
   netstat -ano | findstr :5432
   ```

2. **Verificar se há múltiplos containers PostgreSQL:**
   ```bash
   docker ps -a | grep postgres
   ```

3. **Verificar logs detalhados do Spring Boot:**
   ```bash
   mvn spring-boot:run -Dspring-boot.run.arguments="--debug"
   ```

4. **Testar conexão manual com psql:**
   ```bash
   # Se tiver psql instalado localmente
   psql -h localhost -U postgres -d lirandzo_db
   # Senha: admin123
   ```

## Resumo

**Senha padrão:** `admin123`  
**Usuário:** `postgres`  
**Base de dados:** `lirandzo_db`  
**Porta:** `5432`

**Se erro persistir:** Seguir solução completa passo a passo acima.

# Mudança de Porta do PostgreSQL Docker para 5433

**Data:** 2025-01-08  
**Tipo:** Configuração/Correção  
**Prioridade:** Alta

## O que foi feito

Mudança da porta do PostgreSQL Docker de `5432` para `5433` para evitar conflito com PostgreSQL local instalado no Windows.

## Onde foi modificado

### Ficheiros modificados:
- `docker-compose.yml` - Porta mapeada de 5432 para 5433
- `lirandzo-backend/src/main/resources/application.properties` - URL da base de dados
- `lirandzo-backend/src/main/resources/application-dev.properties` - URL da base de dados
- `lirandzo-backend/src/main/resources/application-prod.properties` - URL da base de dados (porta padrão)

## Porquê foi modificado

**Problema identificado:**
- PostgreSQL local instalado no Windows (versões 16 e 18) está a usar porta 5432
- PostgreSQL local tem senha "elber123" (específica do utilizador)
- Spring Boot conectava ao PostgreSQL local em vez do Docker
- Docker PostgreSQL (porta 5432) conflitava com PostgreSQL local
- Quando colega usar, PostgreSQL local dele pode ter senha diferente

**Solução:**
- Mudar porta do Docker para 5433
- Spring Boot conecta ao Docker na porta 5433
- PostgreSQL local continua na porta 5432 (sem interferência)
- Todos os desenvolvedores usam Docker na mesma porta (5433)

## Como foi implementado

### 1. Docker Compose

**Código ANTES:**
```yaml
ports:
  - "5432:5432"
```

**Código DEPOIS:**
```yaml
ports:
  - "5433:5432"
```

**Explicação:**
- `5433:5432` = porta 5433 do host mapeia para porta 5432 do container
- Container continua a usar 5432 internamente
- Host acessa via 5433

### 2. Application Properties

**application.properties:**
```properties
# ANTES
spring.datasource.url=jdbc:postgresql://localhost:5432/lirandzo_db

# DEPOIS
spring.datasource.url=jdbc:postgresql://localhost:5433/lirandzo_db
```

**application-dev.properties:**
```properties
# ANTES
spring.datasource.url=jdbc:postgresql://localhost:5432/lirandzo_db

# DEPOIS
spring.datasource.url=jdbc:postgresql://localhost:5433/lirandzo_db
```

**application-prod.properties:**
```properties
# ANTES
spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:lirandzo_db}

# DEPOIS
spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5433}/${DB_NAME:lirandzo_db}
```

## Configuração Final

### Portas:
- **PostgreSQL Docker:** `localhost:5433` (host) → `5432` (container)
- **PostgreSQL Local:** `localhost:5432` (não interfere)

### Credenciais Docker:
- **Usuário:** `postgres`
- **Senha:** `admin123`
- **Base de dados:** `lirandzo_db`

## Impacto

### Antes:
- ❌ Conflito de porta com PostgreSQL local
- ❌ Spring Boot conectava ao PostgreSQL local (senha "elber123")
- ❌ Dependência de configurações locais do utilizador
- ❌ Colegas não conseguiam usar (senhas diferentes)

### Depois:
- ✅ Sem conflito de porta
- ✅ Spring Boot conecta ao Docker (senha padronizada "admin123")
- ✅ Independente de PostgreSQL local
- ✅ Todos os desenvolvedores usam mesma configuração

## Como usar

### Iniciar PostgreSQL Docker:

```bash
docker-compose up postgres -d
```

**PostgreSQL estará disponível em:** `localhost:5433`

### Conectar manualmente (se necessário):

```bash
# Via Docker
docker exec lirandzo-postgres psql -U postgres -d lirandzo_db

# Via psql local (se instalado)
psql -h localhost -p 5433 -U postgres -d lirandzo_db
# Senha: admin123
```

### Iniciar Backend:

```bash
cd lirandzo-backend
mvn spring-boot:run
```

**Backend conecta automaticamente em:** `localhost:5433`

## Verificação

Após mudanças, verificar:

```bash
# 1. Container rodando
docker-compose ps postgres

# 2. Porta 5433 acessível
netstat -ano | findstr :5433

# 3. Testar conexão
docker exec lirandzo-postgres psql -U postgres -d lirandzo_db -c "SELECT 1;"

# 4. Iniciar backend (deve conectar sem erros)
cd lirandzo-backend
mvn spring-boot:run
```

## Vantagens

1. **Sem conflitos:** PostgreSQL local e Docker podem rodar simultaneamente
2. **Padronização:** Todos usam Docker na mesma porta
3. **Independência:** Não depende de configurações locais
4. **Facilidade:** Colegas não precisam ajustar nada

## Notas

- PostgreSQL local continua funcionando normalmente na porta 5432
- Docker PostgreSQL agora está na porta 5433
- Aplicações podem usar ambos simultaneamente se necessário
- Para produção, ajustar porta via variável de ambiente se necessário

## Referências

- Ver `docker-compose.yml` para configuração Docker
- Ver `application-dev.properties` para configuração Spring Boot
- Ver `Documentacao/Configuracao/` para outras configurações

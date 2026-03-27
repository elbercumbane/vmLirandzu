# Correção: Autenticação PostgreSQL - Problema com Volume Antigo

**Data:** 2025-01-08  
**Tipo:** Correção de Erro  
**Prioridade:** Crítica

## O que falhou

**Erro:**
```
FATAL: password authentication failed for user "postgres"
```

## Porquê falhou

**Causa:**
- Volume Docker antigo (`postgres_data`) tinha senha diferente da configurada
- Quando o container foi criado pela primeira vez, pode ter usado senha diferente
- Volume persiste dados, incluindo configurações de autenticação
- Ao recriar container, ele mantém dados do volume antigo

## Solução

**Remover volume e recriar container:**

```bash
# Parar e remover container + volumes
docker-compose down -v

# Recriar com senha correta do docker-compose.yml
docker-compose up postgres -d
```

**O que faz:**
- `-v` remove volumes associados
- Ao recriar, usa senha do `docker-compose.yml`: `POSTGRES_PASSWORD: postgres`
- Volume novo é criado com senha correta

## Verificação

Após recriar, verificar:

```bash
# Testar conexão
docker exec lirandzo-postgres psql -U postgres -d lirandzo_db -c "SELECT 1;"

# Verificar usuário
docker exec lirandzo-postgres psql -U postgres -c "\du"
```

## Configuração Correta

**docker-compose.yml:**
```yaml
environment:
  POSTGRES_PASSWORD: postgres
```

**application.properties:**
```properties
spring.datasource.password=postgres
```

Ambos devem corresponder!

## Impacto

### Antes:
- ❌ Backend não conectava ao PostgreSQL
- ❌ Erro de autenticação

### Depois:
- ✅ Volume recriado com senha correta
- ✅ Backend conecta normalmente

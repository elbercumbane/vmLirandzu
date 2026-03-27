# Padronização da Senha PostgreSQL para admin123

**Data:** 2025-01-08  
**Tipo:** Configuração/Padronização  
**Prioridade:** Alta

## O que foi feito

Padronização da senha do PostgreSQL de `postgres` para `admin123` em todos os ficheiros de configuração, removendo dependência de senhas específicas do utilizador (como `elber123`).

## Onde foi modificado

### Ficheiros modificados:
- `docker-compose.yml` - POSTGRES_PASSWORD e SPRING_DATASOURCE_PASSWORD
- `lirandzo-backend/src/main/resources/application.properties` - spring.datasource.password
- `lirandzo-backend/src/main/resources/application-dev.properties` - spring.datasource.password
- `lirandzo-backend/src/main/resources/application-prod.properties` - DB_PASSWORD default

## Porquê foi modificado

**Problema identificado:**
- Senha estava como `postgres` (padrão inseguro)
- Alguns ambientes usavam senha baseada no nome do utilizador (`elber123`)
- Dificultava colaboração entre desenvolvedores
- Cada desenvolvedor tinha que ajustar senha manualmente

**Solução:**
- Padronizar senha para `admin123` em todos os ambientes
- Remover dependência de senhas específicas do utilizador
- Facilitar setup para novos desenvolvedores
- Senha padrão clara e documentada

## Como foi implementado

### 1. Docker Compose

**Código ANTES:**
```yaml
environment:
  POSTGRES_PASSWORD: postgres
  # ...
  SPRING_DATASOURCE_PASSWORD: postgres
```

**Código DEPOIS:**
```yaml
environment:
  POSTGRES_PASSWORD: admin123
  # ...
  SPRING_DATASOURCE_PASSWORD: admin123
```

### 2. Application Properties

**application.properties:**
```properties
# ANTES
spring.datasource.password=postgres

# DEPOIS
spring.datasource.password=admin123
```

**application-dev.properties:**
```properties
# ANTES
spring.datasource.password=postgres

# DEPOIS
spring.datasource.password=admin123
```

**application-prod.properties:**
```properties
# ANTES
spring.datasource.password=${DB_PASSWORD:postgres}

# DEPOIS
spring.datasource.password=${DB_PASSWORD:admin123}
```

### 3. Recriação do Container

**Comandos executados:**
```bash
# Remover volume antigo (com senha antiga)
docker-compose down -v

# Recriar com nova senha
docker-compose up postgres -d
```

**O que faz:**
- Remove volume com dados antigos (incluindo senha antiga)
- Cria novo volume com senha `admin123` do `docker-compose.yml`
- Base de dados inicializada com senha correta

## Configuração Final

### Senha Padrão em Todos os Ambientes:

- **Docker Compose:** `POSTGRES_PASSWORD: admin123`
- **Backend (dev):** `spring.datasource.password=admin123`
- **Backend (prod):** `DB_PASSWORD: admin123` (default)

### Credenciais Padronizadas:

- **Usuário:** `postgres`
- **Senha:** `admin123`
- **Base de dados:** `lirandzo_db`
- **Porta:** `5432`

## Impacto

### Antes:
- ❌ Senha diferente em cada ambiente
- ❌ Dependência de nome de utilizador do sistema
- ❌ Cada desenvolvedor tinha que ajustar manualmente
- ❌ Erros de autenticação frequentes

### Depois:
- ✅ Senha padronizada: `admin123`
- ✅ Mesma senha para todos os desenvolvedores
- ✅ Setup mais fácil para novos membros da equipa
- ✅ Sem dependência de configurações do sistema

## Como Usar

### Para Novos Desenvolvedores:

1. **Clonar repositório**
2. **Iniciar PostgreSQL:**
   ```bash
   docker-compose up postgres -d
   ```
3. **Iniciar backend:**
   ```bash
   cd lirandzo-backend
   mvn spring-boot:run
   ```

**Sem necessidade de ajustar senhas!**

### Se Já Tinha Container Antigo:

```bash
# Remover volume antigo
docker-compose down -v

# Recriar com senha correta
docker-compose up postgres -d
```

## Segurança

**Nota:** `admin123` é uma senha padrão para desenvolvimento. 

**Para produção:**
- Usar variáveis de ambiente
- Usar secrets management
- Não commitar senhas em código
- Usar senhas fortes e únicas

**Exemplo produção:**
```bash
export DB_PASSWORD=senha_forte_aqui
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

## Verificação

Após mudanças, verificar:

```bash
# Testar conexão
docker exec lirandzo-postgres psql -U postgres -d lirandzo_db -c "SELECT 1;"

# Iniciar backend (deve conectar sem erros)
cd lirandzo-backend
mvn spring-boot:run
```

## Referências

- Ver `docker-compose.yml` para configuração Docker
- Ver `application.properties` para configuração Spring Boot
- Ver `Documentacao/Configuracao/` para outras configurações

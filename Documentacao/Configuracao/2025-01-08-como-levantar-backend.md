# Como Levantar o Backend

**Data:** 2025-01-08  
**Tipo:** Guia de Operação

## Pré-requisitos

1. **Java 17** instalado
2. **Maven 3.6+** instalado
3. **PostgreSQL** rodando (via Docker ou localmente)
4. **Docker** (opcional, para PostgreSQL)

## Passos para Levantar o Backend

### 1. Verificar Pré-requisitos

```bash
# Verificar Java
java -version
# Deve mostrar: openjdk version "17" ou similar

# Verificar Maven
mvn --version
# Deve mostrar: Apache Maven 3.x.x
```

### 2. Iniciar PostgreSQL (se usar Docker)

```bash
# Na raiz do projeto
docker-compose up postgres -d

# Verificar se está rodando
docker-compose ps

# Ver logs do PostgreSQL
docker-compose logs postgres
```

### 3. Verificar Configuração

Verificar `lirandzo-backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/lirandzo_db
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### 4. Compilar o Projeto

```bash
cd lirandzo-backend
mvn clean install -DskipTests
```

### 5. Iniciar o Backend

**Opção 1: Maven (Recomendado para desenvolvimento)**

```bash
cd lirandzo-backend
mvn spring-boot:run
```

**Opção 2: JAR**

```bash
cd lirandzo-backend
java -jar target/lirandzo-backend-1.0.0.jar
```

**Opção 3: Docker Compose (se configurado)**

```bash
# Na raiz do projeto
docker-compose up backend -d
```

## Verificar se Está Rodando

### 1. Health Check

```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method GET

# curl (se disponível)
curl http://localhost:8080/api/health

# Navegador
http://localhost:8080/api/health
```

**Resposta esperada:**
```json
{
  "status": "UP",
  "timestamp": "2025-01-08T10:00:00"
}
```

### 2. Verificar Logs

O backend deve mostrar logs como:
```
Started LirandzoBackendApplication in X.XXX seconds
```

### 3. Testar Endpoint de Clientes

```bash
curl http://localhost:8080/api/clientes
```

## Problemas Comuns

### Erro: "Connection refused" ao conectar ao PostgreSQL

**Solução:**
1. Verificar se PostgreSQL está rodando: `docker-compose ps`
2. Verificar porta 5432: `netstat -an | findstr 5432`
3. Verificar credenciais em `application.properties`

### Erro: "Port 8080 already in use"

**Solução:**
1. Encontrar processo usando porta 8080:
   ```powershell
   netstat -ano | findstr :8080
   ```
2. Matar processo ou alterar porta em `application.properties`:
   ```properties
   server.port=8081
   ```

### Erro: "Database lirandzo_db does not exist"

**Solução:**
1. Executar script SQL:
   ```bash
   psql -U postgres -f lirandzo-backend/scripts/init-database.sql
   ```
2. Ou deixar Hibernate criar automaticamente (desenvolvimento):
   ```properties
   spring.jpa.hibernate.ddl-auto=update
   ```

### Backend não inicia

**Verificar:**
1. Logs do Maven/Spring Boot
2. Erros de compilação
3. Dependências faltando: `mvn dependency:resolve`
4. Java version: deve ser 17

## Comandos Úteis

### Ver processos Java rodando

```powershell
Get-Process -Name java
```

### Parar backend

```powershell
# Encontrar PID
Get-Process -Name java | Select-Object Id

# Matar processo
Stop-Process -Id <PID>
```

### Ver logs em tempo real

Se rodando com Maven:
```bash
# Os logs aparecem no terminal onde executou mvn spring-boot:run
```

Se rodando com Docker:
```bash
docker-compose logs -f backend
```

### Reiniciar backend

1. Parar processo atual
2. Executar novamente: `mvn spring-boot:run`

## URLs Importantes

- **API Base:** http://localhost:8080/api
- **Health Check:** http://localhost:8080/api/health
- **Clientes:** http://localhost:8080/api/clientes
- **Encomendas:** http://localhost:8080/api/encomendas

## Próximos Passos

Após backend estar rodando:
1. Testar endpoints via Postman ou curl
2. Verificar conexão com frontend Angular
3. Implementar autenticação JWT (se necessário)

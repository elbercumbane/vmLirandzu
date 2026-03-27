# Como Funciona: Maven, Java e Docker para Base de Dados

**Data:** 2025-01-08  
**Tipo:** Documentação Técnica/Arquitectura  
**Nível:** Intermediário/Avançado

## Visão Geral

Este documento explica como funciona a integração entre **Maven**, **Java (Spring Boot)** e **Docker (PostgreSQL)** neste projeto, desde o código fonte até a base de dados em execução.

## Fluxo Completo: Do Código à Base de Dados

```
┌─────────────────┐
│  Código Java    │
│  (.java files)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Maven       │
│  (pom.xml)      │
│  - Compila      │
│  - Baixa deps   │
│  - Cria JAR     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Spring Boot    │
│  Application    │
│  - Inicia       │
│  - Conecta DB   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Docker      │
│  PostgreSQL     │
│  (Container)    │
└─────────────────┘
```

## Parte 1: Maven - Gerenciador de Dependências e Build

### O que é Maven?

**Maven** é uma ferramenta de automação de build e gerenciamento de dependências para projetos Java. Ele:
- Baixa dependências automaticamente
- Compila código Java
- Executa testes
- Cria arquivos JAR/WAR
- Gerencia o ciclo de vida do projeto

### Como Funciona no Projeto

**Ficheiro:** `lirandzo-backend/pom.xml`

**Código:**

```1:26:lirandzo-backend/pom.xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>

    <groupId>com.lirandzo</groupId>
    <artifactId>lirandzo-backend</artifactId>
    <version>1.0.0</version>
    <name>lirandzo-backend</name>
    <description>Backend API para sistema de facturação e gestão de transportes Lirandzo</description>

    <properties>
        <java.version>17</java.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
```

**Explicação:**

1. **`<parent>` (linhas 8-13):** Herda configurações do Spring Boot
   - Define versões padrão de dependências
   - Configura plugins automaticamente
   - Versão 3.2.0 do Spring Boot

2. **`<groupId>`, `<artifactId>`, `<version>` (linhas 15-17):** Identificação única do projeto
   - `groupId`: `com.lirandzo` (organização)
   - `artifactId`: `lirandzo-backend` (nome do projeto)
   - `version`: `1.0.0` (versão)

3. **`<properties>` (linhas 21-25):** Propriedades do projeto
   - `java.version`: 17 (versão do Java)
   - Define encoding UTF-8

### Dependências Principais

**Código:**

```28:46:lirandzo-backend/pom.xml
    <dependencies>
        <!-- Spring Boot Web Starter -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Boot Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- PostgreSQL Driver -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
```

**Explicação:**

1. **`spring-boot-starter-web`:** Cria APIs REST
   - Inclui Spring MVC
   - Servidor embutido (Tomcat)
   - Serialização JSON

2. **`spring-boot-starter-data-jpa`:** Acesso a dados
   - Inclui Hibernate (ORM)
   - Spring Data JPA
   - Permite mapear classes Java para tabelas SQL

3. **`postgresql`:** Driver JDBC para PostgreSQL
   - `scope: runtime` = só necessário em execução, não em compilação
   - Permite Java conectar ao PostgreSQL

### Como Maven Funciona

**Comando:** `mvn clean install`

**O que acontece:**

1. **`clean`:** Remove pasta `target/` (limpa compilações anteriores)

2. **`compile`:** 
   - Lê `pom.xml`
   - Baixa dependências do repositório Maven Central
   - Compila `.java` → `.class`

3. **`test`:** Executa testes (se houver)

4. **`package`:** Cria JAR em `target/lirandzo-backend-1.0.0.jar`

5. **`install`:** Instala JAR no repositório local Maven (`~/.m2/repository`)

**Exemplo de saída:**
```
[INFO] Scanning for projects...
[INFO] Building lirandzo-backend 1.0.0
[INFO] --- clean:3.3.2:clean
[INFO] --- compiler:3.11.0:compile
[INFO] Compiling 21 source files...
[INFO] --- jar:3.3.0:jar
[INFO] Building jar: target/lirandzo-backend-1.0.0.jar
[INFO] BUILD SUCCESS
```

## Parte 2: Java e Spring Boot - Aplicação

### Como Spring Boot Funciona

**Classe Principal:** `LirandzoBackendApplication.java`

**Código:**

```1:12:lirandzo-backend/src/main/java/com/lirandzo/LirandzoBackendApplication.java
package com.lirandzo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LirandzoBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(LirandzoBackendApplication.class, args);
    }
}
```

**Explicação:**

1. **`@SpringBootApplication` (linha 6):** Anotação que:
   - Habilita auto-configuração
   - Escaneia componentes (`@Component`, `@Service`, `@Repository`, `@Controller`)
   - Configura Spring Boot automaticamente

2. **`SpringApplication.run()` (linha 10):** Inicia a aplicação
   - Carrega configurações de `application.properties`
   - Inicia servidor embutido (Tomcat na porta 8080)
   - Conecta à base de dados
   - Expõe endpoints REST

### Configuração da Base de Dados

**Ficheiro:** `application.properties`

**Código:**

```11:21:lirandzo-backend/src/main/resources/application.properties
# PostgreSQL Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/lirandzo_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true
```

**Explicação linha por linha:**

1. **`spring.datasource.url` (linha 12):**
   - **JDBC URL:** `jdbc:postgresql://localhost:5432/lirandzo_db`
   - Protocolo: `jdbc:postgresql://`
   - Host: `localhost` (ou `postgres` se no Docker)
   - Porta: `5432`
   - Base de dados: `lirandzo_db`
   - **O que faz:** Define onde está o PostgreSQL

2. **`spring.datasource.username/password` (linhas 13-14):**
   - Credenciais para conectar ao PostgreSQL
   - Usuário: `postgres`
   - Senha: `postgres`

3. **`spring.datasource.driver-class-name` (linha 15):**
   - Classe do driver JDBC do PostgreSQL
   - **O que faz:** Spring Boot usa esta classe para conectar

4. **`spring.jpa.hibernate.ddl-auto=update` (linha 18):**
   - **CRÍTICO:** Hibernate atualiza schema automaticamente
   - Se tabela não existe → cria
   - Se tabela existe mas falta coluna → adiciona
   - **⚠️ Em produção usar `validate`**

5. **`spring.jpa.show-sql=true` (linha 19):**
   - Mostra SQL gerado pelo Hibernate no console
   - Útil para debug

6. **`hibernate.dialect` (linha 20):**
   - Diz ao Hibernate que é PostgreSQL
   - Gera SQL específico do PostgreSQL

### Como Java Conecta à Base de Dados

**Fluxo:**

```
1. Spring Boot inicia
   ↓
2. Lê application.properties
   ↓
3. Cria DataSource (pool de conexões)
   ↓
4. Hibernate carrega entidades (@Entity)
   ↓
5. Cria/atualiza tabelas (se ddl-auto=update)
   ↓
6. Aplicação pronta para receber requests
```

**Exemplo: Entidade Cliente**

**Código:**

```12:21:lirandzo-backend/src/main/java/com/lirandzo/entity/Cliente.java
@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
```

**Explicação:**

1. **`@Entity` (linha 12):** Marca classe como entidade JPA
   - Hibernate gerencia esta classe
   - Mapeia para tabela SQL

2. **`@Table(name = "clientes")` (linha 13):** Nome da tabela
   - Se não especificar, usa nome da classe (Cliente → clientes)

3. **`@Id` (linha 19):** Chave primária

4. **`@GeneratedValue` (linha 20):** ID gerado automaticamente
   - `IDENTITY` = usa `SERIAL` do PostgreSQL

**O que Hibernate faz:**

Quando Spring Boot inicia:
1. Escaneia classes com `@Entity`
2. Lê anotações (`@Column`, `@ManyToOne`, etc.)
3. Gera SQL: `CREATE TABLE IF NOT EXISTS clientes (...)`
4. Executa SQL no PostgreSQL

### Repository Pattern

**Código:** `ClienteRepository.java`

```java
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    List<Cliente> findByNomeContainingIgnoreCase(String nome);
}
```

**Como funciona:**

1. **`extends JpaRepository<Cliente, Long>`:**
   - `Cliente` = tipo da entidade
   - `Long` = tipo do ID
   - Spring Data JPA implementa automaticamente:
     - `save()`, `findAll()`, `findById()`, `delete()`, etc.

2. **`findByNomeContainingIgnoreCase()`:**
   - Spring Data JPA gera SQL automaticamente:
     ```sql
     SELECT * FROM clientes WHERE LOWER(nome) LIKE LOWER('%?%')
     ```
   - Nome do método = query SQL

**Uso no Service:**

```java
@Autowired
private ClienteRepository clienteRepository;

public List<Cliente> findAll() {
    return clienteRepository.findAll(); // SQL: SELECT * FROM clientes
}
```

## Parte 3: Docker - Containerização do PostgreSQL

### O que é Docker?

**Docker** cria "containers" isolados que rodam aplicações. Neste projeto, usamos Docker para:
- Rodar PostgreSQL sem instalar localmente
- Isolar ambiente de desenvolvimento
- Facilitar setup (um comando: `docker-compose up`)

### Docker Compose

**Ficheiro:** `docker-compose.yml`

**Código:**

```3:25:docker-compose.yml
services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: lirandzo-postgres
    environment:
      POSTGRES_DB: lirandzo_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./lirandzo-backend/scripts/init-database.sql:/docker-entrypoint-initdb.d/init-database.sql
    networks:
      - lirandzo-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
```

**Explicação linha por linha:**

1. **`image: postgres:15-alpine` (linha 6):**
   - Imagem Docker do PostgreSQL versão 15
   - `alpine` = versão leve (menor tamanho)
   - Docker baixa automaticamente do Docker Hub

2. **`container_name: lirandzo-postgres` (linha 7):**
   - Nome do container
   - Usado para referenciar: `docker exec lirandzo-postgres ...`

3. **`environment` (linhas 8-12):**
   - Variáveis de ambiente do PostgreSQL
   - `POSTGRES_DB`: Cria base de dados `lirandzo_db`
   - `POSTGRES_USER/PASSWORD`: Credenciais
   - **O que faz:** Configura PostgreSQL automaticamente

4. **`ports: "5432:5432"` (linha 14):**
   - Mapeia porta do container para host
   - `host:container`
   - **O que faz:** Permite Java conectar em `localhost:5432`

5. **`volumes` (linhas 16-17):**
   - **`postgres_data`:** Volume persistente
     - Dados ficam salvos mesmo se container parar
   - **`init-database.sql`:** Script SQL executado na primeira inicialização
     - Cria tabelas, índices, dados iniciais

6. **`healthcheck` (linhas 20-24):**
   - Verifica se PostgreSQL está pronto
   - **O que faz:** Outros serviços aguardam este healthcheck

7. **`restart: unless-stopped` (linha 25):**
   - Reinicia automaticamente se container parar

### Como Docker Funciona

**Comando:** `docker-compose up postgres -d`

**O que acontece:**

1. **Docker lê `docker-compose.yml`**
2. **Baixa imagem `postgres:15-alpine`** (se não tiver)
3. **Cria container** com configurações
4. **Inicia PostgreSQL** dentro do container
5. **Executa `init-database.sql`** (primeira vez)
6. **Expõe porta 5432** para o host

**Resultado:**
- PostgreSQL rodando em `localhost:5432`
- Base de dados `lirandzo_db` criada
- Java pode conectar normalmente

### Rede Docker

**Código:**

```51:53:docker-compose.yml
networks:
  lirandzo-network:
    driver: bridge
```

**O que faz:**
- Cria rede isolada
- Containers podem se comunicar pelo nome
- Exemplo: Backend no Docker pode conectar em `postgres:5432` (não precisa `localhost`)

## Fluxo Completo: Integração Tudo Junto

### Cenário: Criar um Cliente

**1. Request HTTP chega:**
```http
POST http://localhost:8080/api/clientes
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com"
}
```

**2. Spring Boot recebe:**
- `ClienteController` processa request
- Valida dados com `@Valid`
- Chama `ClienteService.save()`

**3. Service processa:**
```java
@Autowired
private ClienteRepository clienteRepository;

public Cliente save(Cliente cliente) {
    return clienteRepository.save(cliente);
}
```

**4. Hibernate gera SQL:**
```sql
INSERT INTO clientes (nome, email, data_criacao) 
VALUES ('João Silva', 'joao@example.com', NOW())
```

**5. JDBC Driver envia SQL:**
- Driver PostgreSQL (`org.postgresql.Driver`)
- Conecta em `jdbc:postgresql://localhost:5432/lirandzo_db`
- Usa credenciais: `postgres/postgres`

**6. Docker PostgreSQL recebe:**
- Container `lirandzo-postgres` recebe SQL
- Executa no PostgreSQL dentro do container
- Salva em volume `postgres_data`

**7. Resposta:**
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@example.com",
  "dataCriacao": "2025-01-08T10:00:00"
}
```

## Diagrama de Arquitectura Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    DESENVOLVEDOR                            │
│  Escreve código Java (.java)                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      MAVEN                                   │
│  pom.xml                                                    │
│  ├─ Baixa dependências (Spring Boot, PostgreSQL Driver)     │
│  ├─ Compila .java → .class                                  │
│  └─ Cria JAR: lirandzo-backend-1.0.0.jar                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   SPRING BOOT                               │
│  LirandzoBackendApplication.java                            │
│  ├─ Lê application.properties                               │
│  ├─ Cria DataSource (pool de conexões)                      │
│  ├─ Hibernate mapeia @Entity → tabelas SQL                  │
│  └─ Inicia servidor Tomcat (porta 8080)                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ JDBC Connection
                        │ jdbc:postgresql://localhost:5432/lirandzo_db
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOCKER                                 │
│  Container: lirandzo-postgres                               │
│  ├─ Imagem: postgres:15-alpine                              │
│  ├─ Porta: 5432 (mapeada para host)                         │
│  ├─ Volume: postgres_data (dados persistentes)              │
│  └─ Script: init-database.sql (executado na primeira vez)  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   POSTGRESQL                                │
│  Base de dados: lirandzo_db                                 │
│  ├─ Tabelas: clientes, encomendas, usuarios, etc.        │
│  └─ Dados salvos em: /var/lib/postgresql/data              │
└─────────────────────────────────────────────────────────────┘
```

## Comandos Práticos

### 1. Iniciar PostgreSQL (Docker)

```bash
docker-compose up postgres -d
```

**O que faz:**
- Cria e inicia container PostgreSQL
- Cria base de dados `lirandzo_db`
- Expõe porta 5432

### 2. Compilar Projeto (Maven)

```bash
cd lirandzo-backend
mvn clean install
```

**O que faz:**
- Limpa compilações anteriores
- Baixa dependências
- Compila código Java
- Cria JAR

### 3. Iniciar Backend (Spring Boot)

```bash
cd lirandzo-backend
mvn spring-boot:run
```

**O que faz:**
- Inicia Spring Boot
- Conecta ao PostgreSQL em `localhost:5432`
- Hibernate cria/atualiza tabelas
- Servidor fica disponível em `http://localhost:8080/api`

### 4. Verificar Conexão

```bash
# Verificar PostgreSQL
docker exec lirandzo-postgres psql -U postgres -d lirandzo_db -c "SELECT version();"

# Verificar Backend
curl http://localhost:8080/api/health
```

## Resumo: Como Tudo Funciona Juntos

1. **Maven:**
   - Gerencia dependências (Spring Boot, PostgreSQL Driver)
   - Compila código Java
   - Cria JAR executável

2. **Java/Spring Boot:**
   - Lê configurações (`application.properties`)
   - Cria pool de conexões JDBC
   - Hibernate mapeia classes Java para tabelas SQL
   - Expõe APIs REST

3. **Docker:**
   - Roda PostgreSQL isolado
   - Expõe porta 5432 para Java conectar
   - Persiste dados em volumes

4. **Fluxo de Dados:**
   ```
   Request HTTP → Spring Boot → Hibernate → JDBC → PostgreSQL (Docker) → Resposta
   ```

## Conceitos-Chave

### JDBC (Java Database Connectivity)
- API Java para conectar a bases de dados
- Driver PostgreSQL implementa JDBC
- Spring Boot usa JDBC internamente

### JPA/Hibernate
- **JPA:** Especificação Java para mapeamento objeto-relacional
- **Hibernate:** Implementação de JPA
- Converte classes Java em SQL automaticamente

### Connection Pool (HikariCP)
- Pool de conexões reutilizáveis
- Evita criar/fechar conexão a cada request
- Configurado em `application.properties`:
  ```properties
  spring.datasource.hikari.maximum-pool-size=10
  ```

### Docker Volumes
- Dados persistem mesmo se container parar
- Volume `postgres_data` guarda dados do PostgreSQL
- Se deletar container, dados ficam no volume

## Próximos Passos

Para entender melhor:
1. Ver logs do Spring Boot ao iniciar (mostra SQL gerado)
2. Verificar tabelas criadas: `docker exec lirandzo-postgres psql -U postgres -d lirandzo_db -c "\dt"`
3. Testar endpoints e ver SQL no console
4. Explorar código das entidades e repositories

## Referências

- **Maven:** https://maven.apache.org/
- **Spring Boot:** https://spring.io/projects/spring-boot
- **Docker:** https://www.docker.com/
- **PostgreSQL:** https://www.postgresql.org/
- **Hibernate:** https://hibernate.org/

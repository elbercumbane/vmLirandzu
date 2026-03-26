# Resumo Visual: Maven, Java e Docker

**Data:** 2025-01-08  
**Tipo:** Resumo Visual

## Fluxo Simplificado

```
┌──────────────┐
│  Você escreve │
│  código Java  │
│  Cliente.java │
└──────┬───────┘
       │
       ▼
┌──────────────┐      ┌──────────────┐
│    Maven     │─────▶│  Baixa deps  │
│   pom.xml    │      │ Spring Boot  │
│              │      │ PostgreSQL   │
└──────┬───────┘      └──────────────┘
       │
       ▼
┌──────────────┐
│   Compila    │
│  .java → JAR │
└──────┬───────┘
       │
       ▼
┌──────────────┐      ┌──────────────┐
│ Spring Boot  │─────▶│  application │
│   Inicia     │      │ .properties   │
└──────┬───────┘      └──────────────┘
       │
       │ Lê: jdbc:postgresql://localhost:5432/lirandzo_db
       │
       ▼
┌──────────────┐
│   Docker     │
│  PostgreSQL  │
│  Container   │
└──────────────┘
```

## Comparação: Com e Sem Docker

### ❌ SEM Docker (Tradicional)

```
1. Instalar PostgreSQL no Windows
2. Configurar PostgreSQL manualmente
3. Criar base de dados manualmente
4. Configurar usuário/senha
5. Iniciar serviço PostgreSQL
6. Configurar Java para conectar
```

**Problemas:**
- Difícil setup
- Diferenças entre ambientes
- Conflitos de versão

### ✅ COM Docker (Este Projeto)

```
1. docker-compose up postgres -d
```

**Vantagens:**
- Um comando resolve tudo
- Ambiente isolado
- Mesmo ambiente para todos

## Componentes e Suas Funções

### Maven (pom.xml)
**Função:** Gerenciador de build
- ✅ Baixa dependências
- ✅ Compila código
- ✅ Cria JAR

**Exemplo:**
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>
```
→ Maven baixa driver PostgreSQL automaticamente

### Java/Spring Boot
**Função:** Aplicação servidor
- ✅ Recebe requests HTTP
- ✅ Processa lógica de negócio
- ✅ Conecta à base de dados

**Exemplo:**
```java
@RestController
public class ClienteController {
    @GetMapping("/clientes")
    public List<Cliente> getAll() {
        return clienteRepository.findAll();
    }
}
```
→ Expõe endpoint REST

### Hibernate/JPA
**Função:** Mapeamento objeto-relacional
- ✅ Converte classes Java em SQL
- ✅ Gerencia ciclo de vida de objetos
- ✅ Cria/atualiza tabelas

**Exemplo:**
```java
@Entity
@Table(name = "clientes")
public class Cliente {
    @Id
    private Long id;
    private String nome;
}
```
→ Hibernate cria tabela `clientes` automaticamente

### Docker
**Função:** Containerização
- ✅ Isola PostgreSQL
- ✅ Facilita setup
- ✅ Persiste dados

**Exemplo:**
```yaml
postgres:
  image: postgres:15-alpine
  ports:
    - "5432:5432"
```
→ PostgreSQL rodando em container

## Fluxo de Dados: Exemplo Real

### Criar Cliente

**1. Request:**
```http
POST /api/clientes
{
  "nome": "João",
  "email": "joao@example.com"
}
```

**2. Spring Boot:**
```java
@PostMapping
public Cliente create(@RequestBody Cliente cliente) {
    return clienteRepository.save(cliente);
}
```

**3. Hibernate gera SQL:**
```sql
INSERT INTO clientes (nome, email, data_criacao)
VALUES ('João', 'joao@example.com', NOW())
```

**4. JDBC envia para PostgreSQL:**
```
jdbc:postgresql://localhost:5432/lirandzo_db
```

**5. Docker PostgreSQL executa:**
```sql
-- Executa INSERT
-- Salva em volume postgres_data
```

**6. Resposta:**
```json
{
  "id": 1,
  "nome": "João",
  "email": "joao@example.com"
}
```

## Comandos Essenciais

### Setup Inicial
```bash
# 1. Iniciar PostgreSQL
docker-compose up postgres -d

# 2. Compilar projeto
cd lirandzo-backend
mvn clean install

# 3. Iniciar backend
mvn spring-boot:run
```

### Verificar
```bash
# PostgreSQL rodando?
docker-compose ps

# Backend respondendo?
curl http://localhost:8080/api/health

# Ver tabelas criadas?
docker exec lirandzo-postgres psql -U postgres -d lirandzo_db -c "\dt"
```

## Conceitos-Chave Resumidos

| Conceito | O que faz | Exemplo |
|----------|-----------|---------|
| **Maven** | Gerencia dependências e build | `mvn clean install` |
| **Spring Boot** | Framework Java para APIs | `@RestController` |
| **Hibernate** | ORM (mapeia Java → SQL) | `@Entity` → tabela |
| **JDBC** | API para conectar a DB | `jdbc:postgresql://...` |
| **Docker** | Containerização | `docker-compose up` |
| **PostgreSQL** | Base de dados relacional | Tabelas SQL |

## Perguntas Frequentes

### Por que Maven?
**R:** Gerencia dependências automaticamente. Sem Maven, teria que baixar manualmente Spring Boot, PostgreSQL Driver, etc.

### Por que Spring Boot?
**R:** Facilita criação de APIs REST. Sem Spring Boot, teria que configurar servidor, JSON, etc. manualmente.

### Por que Hibernate?
**R:** Evita escrever SQL manualmente. Hibernate converte classes Java em SQL automaticamente.

### Por que Docker?
**R:** Facilita setup. Um comando (`docker-compose up`) inicia PostgreSQL pronto para usar.

### Como tudo se conecta?
**R:** 
1. Java usa JDBC para conectar
2. JDBC URL aponta para `localhost:5432`
3. Docker mapeia porta 5432 do container para host
4. Java conecta normalmente

## Próximos Passos

1. Ler documentação completa: `como-funciona-maven-java-docker.md`
2. Ver código real do projeto
3. Testar comandos práticos
4. Explorar logs do Spring Boot (mostra SQL gerado)

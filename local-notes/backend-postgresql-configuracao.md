# Configuração do Backend Java com PostgreSQL

## Data de Criação
2025-01-XX

## O Que Foi Criado

Foi criado um backend completo em Java usando Spring Boot e Maven, configurado para usar PostgreSQL como base de dados.

## Estrutura Criada

### 1. **Estrutura Maven Padrão**
```
lirandzo-backend/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/lirandzo/
│   │   │   ├── LirandzoBackendApplication.java
│   │   │   ├── config/
│   │   │   │   ├── CorsConfig.java
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── entity/
│   │   │   │   ├── Cliente.java
│   │   │   │   ├── Encomenda.java
│   │   │   │   ├── Pagamento.java
│   │   │   │   ├── Viagem.java
│   │   │   │   ├── Motorista.java
│   │   │   │   └── Viatura.java
│   │   │   ├── repository/
│   │   │   │   ├── ClienteRepository.java
│   │   │   │   ├── EncomendaRepository.java
│   │   │   │   ├── ViagemRepository.java
│   │   │   │   ├── MotoristaRepository.java
│   │   │   │   └── ViaturaRepository.java
│   │   │   ├── service/
│   │   │   │   ├── ClienteService.java
│   │   │   │   └── EncomendaService.java
│   │   │   └── controller/
│   │   │       ├── ClienteController.java
│   │   │       ├── EncomendaController.java
│   │   │       └── HealthController.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
└── .gitignore
```

### 2. **Dependências Maven (pom.xml)**

O projeto inclui as seguintes dependências principais:
- **Spring Boot Web Starter** - Para criar APIs REST
- **Spring Boot Data JPA** - Para acesso a dados com JPA/Hibernate
- **PostgreSQL Driver** - Driver JDBC para PostgreSQL
- **Spring Boot Validation** - Para validação de dados
- **Spring Boot Security** - Para autenticação e autorização (configurado temporariamente para permitir todas as requisições)
- **Lombok** - Para reduzir boilerplate code
- **Spring Boot DevTools** - Para desenvolvimento (hot reload)

### 3. **Configuração do PostgreSQL (application.properties)**

```properties
# Base de dados
spring.datasource.url=jdbc:postgresql://localhost:5432/lirandzo_db
spring.datasource.username=postgres
spring.datasource.password=postgres

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Servidor
server.port=8080
server.servlet.context-path=/api
```

### 4. **Entidades Criadas**

#### Cliente
- Campos: id, nome, telefone, email, endereco, nif
- Estatísticas: valorTotalFaturado, valorEmDivida, numeroEncomendas
- Relação: OneToMany com Encomenda

#### Encomenda
- Campos: numeroEncomenda, produto, origem, destino, valorTotal, valorPago, valorDivida
- Status: PAGO, PARCIAL, NAO_PAGO
- Relações: ManyToOne com Cliente e Viagem, OneToMany com Pagamento
- Lógica automática de cálculo de dívida e status

#### Pagamento
- Campos: valor, dataPagamento, referencia, observacoes
- Relação: ManyToOne com Encomenda

#### Viagem
- Campos: origem, destino, datas (partida, chegada prevista/real)
- Status: PLANEADA, EM_CURSO, CONCLUIDA, CANCELADA
- Relações: ManyToOne com Motorista e Viatura, OneToMany com Encomenda

#### Motorista
- Campos: nome, telefone, numeroCarta, avaliacaoMedia, numeroViagens
- Status: ATIVO, INATIVO

#### Viatura
- Campos: marca, modelo, matricula, tipo, capacidade
- Status: ATIVA, EM_MANUTENCAO, RESERVADA, INATIVA

### 5. **Repositórios (Spring Data JPA)**

Todos os repositórios estendem `JpaRepository` e incluem métodos de pesquisa customizados:
- `ClienteRepository` - pesquisa por NIF, nome, telefone, dívidas
- `EncomendaRepository` - pesquisa por cliente, status, datas, produto, origem/destino
- `ViagemRepository` - pesquisa por motorista, viatura, status
- `MotoristaRepository` - pesquisa por status, nome
- `ViaturaRepository` - pesquisa por matrícula, status, tipo

### 6. **Serviços**

#### ClienteService
- CRUD completo
- Pesquisa por nome/telefone
- Listagem de clientes com dívidas

#### EncomendaService
- CRUD completo
- Filtros por status e datas
- Adição de pagamentos com atualização automática de estatísticas
- Atualização automática de estatísticas do cliente

### 7. **Controladores REST**

#### ClienteController
- `GET /api/clientes` - Listar todos
- `GET /api/clientes/{id}` - Obter por ID
- `POST /api/clientes` - Criar novo
- `PUT /api/clientes/{id}` - Atualizar
- `DELETE /api/clientes/{id}` - Eliminar
- `GET /api/clientes/search` - Pesquisar
- `GET /api/clientes/dividas` - Listar com dívidas

#### EncomendaController
- `GET /api/encomendas` - Listar (com filtros opcionais)
- `GET /api/encomendas/{id}` - Obter por ID
- `POST /api/encomendas` - Criar nova
- `PUT /api/encomendas/{id}` - Atualizar
- `DELETE /api/encomendas/{id}` - Eliminar
- `GET /api/encomendas/cliente/{clienteId}` - Por cliente
- `POST /api/encomendas/{id}/pagamento` - Adicionar pagamento

#### HealthController
- `GET /api/health` - Verificar saúde da API

### 8. **Configurações**

#### CorsConfig
- Configurado para permitir requisições do Angular frontend (localhost:4200 e 4201)
- Métodos permitidos: GET, POST, PUT, DELETE, OPTIONS, PATCH
- Headers permitidos: todos

#### SecurityConfig
- Temporariamente configurado para permitir todas as requisições (sem autenticação)
- CSRF desabilitado
- Sessões stateless

## Como Usar

### Pré-requisitos

1. **Java 17** instalado
2. **Maven** instalado
3. **PostgreSQL** instalado e a correr

### Passos para Configurar

1. **Criar a base de dados PostgreSQL:**
```sql
CREATE DATABASE lirandzo_db;
```

2. **Configurar credenciais** no `application.properties`:
   - Alterar `spring.datasource.username` e `spring.datasource.password` conforme necessário

3. **Compilar o projeto:**
```bash
cd lirandzo-backend
mvn clean install
```

4. **Executar a aplicação:**
```bash
mvn spring-boot:run
```

Ou executar diretamente a classe `LirandzoBackendApplication` no IDE.

### Endpoints Disponíveis

A API estará disponível em: `http://localhost:8080/api`

- Health check: `http://localhost:8080/api/health`
- Clientes: `http://localhost:8080/api/clientes`
- Encomendas: `http://localhost:8080/api/encomendas`

### Integração com Frontend Angular

O backend está configurado para aceitar requisições do frontend Angular que corre em `http://localhost:4200`.

Para usar no Angular, criar um serviço que faça requisições HTTP:

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getClientes() {
    return this.http.get(`${this.apiUrl}/clientes`);
  }
}
```

## Próximos Passos

1. **Autenticação e Autorização**
   - Implementar JWT tokens
   - Configurar roles e permissões
   - Proteger endpoints sensíveis

2. **Validações Adicionais**
   - Validações de negócio mais complexas
   - Validações de integridade referencial

3. **Testes**
   - Testes unitários para serviços
   - Testes de integração para controladores
   - Testes de repositórios

4. **Documentação API**
   - Integrar Swagger/OpenAPI
   - Documentar todos os endpoints

5. **Tratamento de Erros**
   - Criar exceções customizadas
   - Handler global de exceções
   - Mensagens de erro padronizadas

6. **Logging**
   - Configurar logging adequado
   - Logs de auditoria

7. **Migrações de Base de Dados**
   - Usar Flyway ou Liquibase para controlo de versões do schema

## Notas Técnicas

- **Hibernate DDL Auto**: Configurado como `update` para desenvolvimento. Em produção, usar `validate` ou `none` e usar migrações.
- **Timezone**: Configurado para `Africa/Maputo` (Moçambique).
- **Connection Pool**: Usando HikariCP (padrão do Spring Boot) com configurações otimizadas.
- **Lombok**: Usado para reduzir boilerplate (getters, setters, construtores).

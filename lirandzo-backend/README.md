# Lirandzo Backend API

Backend REST API desenvolvido em Java com Spring Boot e PostgreSQL para o sistema de facturação e gestão de transportes Lirandzo.

## Tecnologias

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA / Hibernate**
- **PostgreSQL**
- **Maven**
- **Lombok**

## Pré-requisitos

- Java 17 ou superior
- Maven 3.6+
- PostgreSQL 12+

## Configuração Inicial

### 1. Criar Base de Dados PostgreSQL

```sql
CREATE DATABASE lirandzo_db;
```

Ou usar o script SQL fornecido em `scripts/init-database.sql`.

### 2. Configurar Credenciais

Editar `src/main/resources/application.properties` e ajustar as credenciais:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/lirandzo_db
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
```

### 3. Compilar o Projeto

```bash
mvn clean install
```

### 4. Executar a Aplicação

```bash
mvn spring-boot:run
```

A aplicação estará disponível em: `http://localhost:8080/api`

## Estrutura do Projeto

```
src/main/java/com/lirandzo/
├── LirandzoBackendApplication.java    # Classe principal
├── config/                              # Configurações (CORS, Security)
├── entity/                              # Entidades JPA
│   ├── Cliente.java
│   ├── Encomenda.java
│   ├── Pagamento.java
│   ├── Viagem.java
│   ├── Motorista.java
│   └── Viatura.java
├── repository/                          # Repositórios Spring Data JPA
├── service/                             # Lógica de negócio
└── controller/                          # Controladores REST
```

## Endpoints Disponíveis

### Health Check
- `GET /api/health` - Verificar status da API

### Clientes
- `GET /api/clientes` - Listar todos os clientes
- `GET /api/clientes/{id}` - Obter cliente por ID
- `POST /api/clientes` - Criar novo cliente
- `PUT /api/clientes/{id}` - Atualizar cliente
- `DELETE /api/clientes/{id}` - Eliminar cliente
- `GET /api/clientes/search?nome=...&telefone=...` - Pesquisar clientes
- `GET /api/clientes/dividas` - Listar clientes com dívidas

### Encomendas
- `GET /api/encomendas` - Listar todas as encomendas
- `GET /api/encomendas?status=PAGO` - Filtrar por status
- `GET /api/encomendas?dataInicio=2025-01-01&dataFim=2025-01-31` - Filtrar por datas
- `GET /api/encomendas/{id}` - Obter encomenda por ID
- `POST /api/encomendas` - Criar nova encomenda
- `PUT /api/encomendas/{id}` - Atualizar encomenda
- `DELETE /api/encomendas/{id}` - Eliminar encomenda
- `GET /api/encomendas/cliente/{clienteId}` - Encomendas de um cliente
- `POST /api/encomendas/{id}/pagamento` - Adicionar pagamento a uma encomenda

## Exemplo de Uso

### Criar um Cliente

```bash
curl -X POST http://localhost:8080/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "telefone": "+258841234567",
    "email": "joao@example.com",
    "endereco": "Maputo, Moçambique",
    "nif": "123456789"
  }'
```

### Criar uma Encomenda

```bash
curl -X POST http://localhost:8080/api/encomendas \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": {"id": 1},
    "produto": "Cimento",
    "origem": "Maputo",
    "destino": "Beira",
    "valorTotal": 50000.00,
    "dataEncomenda": "2025-01-15"
  }'
```

### Adicionar Pagamento

```bash
curl -X POST http://localhost:8080/api/encomendas/1/pagamento \
  -H "Content-Type: application/json" \
  -d '25000.00'
```

## Desenvolvimento

### Hot Reload

O projeto inclui Spring Boot DevTools para hot reload durante o desenvolvimento. Basta manter a aplicação a correr e fazer alterações no código.

### Logs

Os logs SQL estão habilitados por padrão. Para desabilitar, alterar em `application.properties`:

```properties
spring.jpa.show-sql=false
logging.level.org.hibernate.SQL=INFO
```

## Integração com Frontend Angular

O backend está configurado para aceitar requisições CORS do frontend Angular que corre em `http://localhost:4200`.

Para usar no Angular:

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

  createCliente(cliente: any) {
    return this.http.post(`${this.apiUrl}/clientes`, cliente);
  }
}
```

## Próximos Passos

- [ ] Implementar autenticação JWT
- [ ] Adicionar testes unitários e de integração
- [ ] Integrar Swagger/OpenAPI para documentação
- [ ] Implementar tratamento de erros global
- [ ] Adicionar migrações de base de dados (Flyway/Liquibase)
- [ ] Implementar paginação nas listagens
- [ ] Adicionar filtros avançados

## Documentação Adicional

Ver `local-notes/backend-postgresql-configuracao.md` para documentação detalhada da configuração e arquitectura.

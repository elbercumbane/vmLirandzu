# Endpoints API Completos - vmLirandzu

**Data:** 2025-01-08  
**Tipo:** Documentação API  
**Status:** ✅ Completo

## Base URL

```
http://localhost:8080/api
```

## Endpoints Disponíveis

### 1. Clientes (`/clientes`)

#### GET `/clientes`
Lista todos os clientes.

**Resposta:** `200 OK`
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "telefone": "+258841234567",
    "email": "joao@example.com",
    "endereco": "Maputo",
    "nif": "123456789",
    "valorTotalFaturado": 50000.00,
    "valorEmDivida": 5000.00,
    "numeroEncomendas": 10
  }
]
```

#### GET `/clientes/{id}`
Obtém cliente por ID.

#### POST `/clientes`
Cria novo cliente.

**Campos obrigatórios:**
- `nome` (String, obrigatório)

**Campos opcionais:**
- `telefone` (String)
- `email` (String)
- `endereco` (String)
- `nif` (String)

**Exemplo:**
```json
{
  "nome": "João Silva",
  "telefone": "+258841234567",
  "email": "joao@example.com",
  "endereco": "Maputo",
  "nif": "123456789"
}
```

#### PUT `/clientes/{id}`
Atualiza cliente.

#### DELETE `/clientes/{id}`
Remove cliente.

#### GET `/clientes/search?nome={nome}&telefone={telefone}`
Busca clientes por nome ou telefone.

#### GET `/clientes/dividas`
Lista clientes com dívidas.

---

### 2. Encomendas (`/encomendas`)

#### GET `/encomendas`
Lista todas as encomendas.

**Query Parameters:**
- `status` (PAGO, PARCIAL, NAO_PAGO)
- `dataInicio` (LocalDate)
- `dataFim` (LocalDate)

#### GET `/encomendas/{id}`
Obtém encomenda por ID.

#### POST `/encomendas`
Cria nova encomenda.

**Campos obrigatórios:**
- `cliente` (objeto Cliente com id)
- `produto` (String)
- `origem` (String)
- `destino` (String)
- `valorTotal` (Double)

**Campos opcionais:**
- `valorPago` (Double, default: 0.0)
- `dataEncomenda` (LocalDate)
- `viagem` (objeto Viagem com id)

**Exemplo:**
```json
{
  "cliente": { "id": 1 },
  "produto": "Cimento",
  "origem": "Maputo",
  "destino": "Beira",
  "valorTotal": 5000.00,
  "dataEncomenda": "2025-01-08"
}
```

#### PUT `/encomendas/{id}`
Atualiza encomenda.

#### DELETE `/encomendas/{id}`
Remove encomenda.

#### GET `/encomendas/cliente/{clienteId}`
Lista encomendas de um cliente.

#### POST `/encomendas/{id}/pagamento`
Adiciona pagamento a uma encomenda.

**Body:** `Double` (valor do pagamento)

---

### 3. Motoristas (`/motoristas`)

#### GET `/motoristas`
Lista todos os motoristas.

#### GET `/motoristas/{id}`
Obtém motorista por ID.

#### POST `/motoristas`
Cria novo motorista.

**Campos obrigatórios:**
- `nome` (String)

**Campos opcionais:**
- `telefone` (String)
- `numeroCarta` (String)
- `avaliacaoMedia` (Double, default: 0.0)
- `status` (ATIVO, INATIVO, default: ATIVO)

**Exemplo:**
```json
{
  "nome": "Carlos Santos",
  "telefone": "+258842345678",
  "numeroCarta": "C123456",
  "status": "ATIVO"
}
```

#### PUT `/motoristas/{id}`
Atualiza motorista.

#### DELETE `/motoristas/{id}`
Remove motorista.

#### GET `/motoristas/status/{status}`
Lista motoristas por status (ATIVO, INATIVO).

#### GET `/motoristas/search?nome={nome}`
Busca motoristas por nome.

---

### 4. Viaturas (`/viaturas`)

#### GET `/viaturas`
Lista todas as viaturas.

#### GET `/viaturas/{id}`
Obtém viatura por ID.

#### POST `/viaturas`
Cria nova viatura.

**Campos obrigatórios:**
- `marca` (String)
- `modelo` (String)
- `matricula` (String, único)

**Campos opcionais:**
- `tipo` (String)
- `capacidade` (Double)
- `status` (ATIVA, EM_MANUTENCAO, RESERVADA, INATIVA, default: ATIVA)

**Exemplo:**
```json
{
  "marca": "Mercedes",
  "modelo": "Actros",
  "matricula": "ABC-123",
  "tipo": "Camião",
  "capacidade": 20.0,
  "status": "ATIVA"
}
```

#### PUT `/viaturas/{id}`
Atualiza viatura.

#### DELETE `/viaturas/{id}`
Remove viatura.

#### GET `/viaturas/matricula/{matricula}`
Obtém viatura por matrícula.

#### GET `/viaturas/status/{status}`
Lista viaturas por status.

#### GET `/viaturas/tipo/{tipo}`
Lista viaturas por tipo.

---

### 5. Viagens (`/viagens`)

#### GET `/viagens`
Lista todas as viagens.

#### GET `/viagens/{id}`
Obtém viagem por ID.

#### POST `/viagens`
Cria nova viagem.

**Campos obrigatórios:**
- `origem` (String)
- `destino` (String)

**Campos opcionais:**
- `motorista` (objeto Motorista com id)
- `viatura` (objeto Viatura com id)
- `dataPartida` (LocalDate)
- `dataChegadaPrevista` (LocalDate)
- `dataChegadaReal` (LocalDate)
- `status` (PLANEADA, EM_CURSO, CONCLUIDA, CANCELADA, default: PLANEADA)
- `combustivelConsumido` (Double)
- `custoCombustivel` (Double)

**Exemplo:**
```json
{
  "motorista": { "id": 1 },
  "viatura": { "id": 1 },
  "origem": "Maputo",
  "destino": "Beira",
  "dataPartida": "2025-01-10",
  "dataChegadaPrevista": "2025-01-12",
  "status": "PLANEADA"
}
```

#### PUT `/viagens/{id}`
Atualiza viagem.

#### DELETE `/viagens/{id}`
Remove viagem.

#### GET `/viagens/motorista/{motoristaId}`
Lista viagens de um motorista.

#### GET `/viagens/viatura/{viaturaId}`
Lista viagens de uma viatura.

#### GET `/viagens/status/{status}`
Lista viagens por status.

---

### 6. Pagamentos (`/pagamentos`)

#### GET `/pagamentos`
Lista todos os pagamentos.

#### GET `/pagamentos/{id}`
Obtém pagamento por ID.

#### POST `/pagamentos`
Cria novo pagamento.

**Campos obrigatórios:**
- `encomenda` (objeto Encomenda com numeroEncomenda)
- `valor` (Double)

**Campos opcionais:**
- `dataPagamento` (LocalDate, default: hoje)
- `referencia` (String)
- `observacoes` (String)

**Exemplo:**
```json
{
  "encomenda": { "numeroEncomenda": 1 },
  "valor": 2000.00,
  "referencia": "REF-001",
  "observacoes": "Pagamento parcial"
}
```

#### PUT `/pagamentos/{id}`
Atualiza pagamento.

#### DELETE `/pagamentos/{id}`
Remove pagamento.

#### GET `/pagamentos/encomenda/{encomendaId}`
Lista pagamentos de uma encomenda.

---

## Validações

Todos os endpoints validam:
- Campos obrigatórios (`@NotNull`, `@NotBlank`)
- Tipos de dados
- Relações entre entidades

**Erro de validação:** `400 Bad Request`
```json
{
  "timestamp": "2025-01-08T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "nome",
      "message": "Nome é obrigatório"
    }
  ]
}
```

## Códigos de Resposta

- `200 OK` - Sucesso
- `201 Created` - Recurso criado
- `204 No Content` - Recurso removido
- `400 Bad Request` - Erro de validação
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro do servidor

## Notas Importantes

1. **Datas:** Use formato ISO (`YYYY-MM-DD`)
2. **Valores monetários:** Use `Double` (ex: `5000.00`)
3. **Relações:** Ao criar/atualizar, envie apenas o ID do objeto relacionado
4. **Campos calculados:** `valorDivida`, `valorTotalFaturado`, etc. são calculados automaticamente
5. **Status:** Use os valores enum definidos (ex: `ATIVO`, `PLANEADA`, `PAGO`)

## Exemplo Completo de Fluxo

1. **Criar Cliente:**
```bash
POST /api/clientes
{
  "nome": "João Silva",
  "telefone": "+258841234567"
}
```

2. **Criar Viatura:**
```bash
POST /api/viaturas
{
  "marca": "Mercedes",
  "modelo": "Actros",
  "matricula": "ABC-123"
}
```

3. **Criar Motorista:**
```bash
POST /api/motoristas
{
  "nome": "Carlos Santos",
  "telefone": "+258842345678"
}
```

4. **Criar Viagem:**
```bash
POST /api/viagens
{
  "motorista": { "id": 1 },
  "viatura": { "id": 1 },
  "origem": "Maputo",
  "destino": "Beira"
}
```

5. **Criar Encomenda:**
```bash
POST /api/encomendas
{
  "cliente": { "id": 1 },
  "produto": "Cimento",
  "origem": "Maputo",
  "destino": "Beira",
  "valorTotal": 5000.00,
  "viagem": { "id": 1 }
}
```

6. **Adicionar Pagamento:**
```bash
POST /api/pagamentos
{
  "encomenda": { "numeroEncomenda": 1 },
  "valor": 2000.00,
  "referencia": "REF-001"
}
```

# Gestão de Encomendas com Sistema de Pagamentos

**Data:** 2025-01-08  
**Tipo:** Funcionalidade  
**Prioridade:** Alta  
**Componente:** Backend

## O que foi feito

Implementação completa do sistema de gestão de encomendas com cálculo automático de dívidas, status de pagamento e integração com sistema de pagamentos.

## Onde foi implementado

### Ficheiros principais:
- `lirandzo-backend/src/main/java/com/lirandzo/entity/Encomenda.java` (100 linhas)
- `lirandzo-backend/src/main/java/com/lirandzo/service/EncomendaService.java` (119 linhas)
- `lirandzo-backend/src/main/java/com/lirandzo/controller/EncomendaController.java` (linhas principais)
- `lirandzo-backend/src/main/java/com/lirandzo/entity/Pagamento.java`

## Porquê foi implementado

**Necessidade:**
O sistema precisa de rastrear encomendas, calcular automaticamente dívidas pendentes, atualizar status de pagamento (PAGO, PARCIAL, NAO_PAGO) e manter estatísticas atualizadas dos clientes.

**Solução:**
Implementação de entidade Encomenda com lógica automática de cálculo de dívida e status, integrada com sistema de pagamentos e atualização automática de estatísticas do cliente.

## Arquitectura da Funcionalidade

```
Cliente (1) ──< (N) Encomenda (1) ──< (N) Pagamento
                │
                └──> Cálculo automático de dívida e status
                └──> Atualização automática de estatísticas do Cliente
```

## Código das Partes Chave

### 1. Entidade Encomenda

**Localização:** `lirandzo-backend/src/main/java/com/lirandzo/entity/Encomenda.java`

**Responsabilidade:** Representa uma encomenda com cálculo automático de dívida e status de pagamento.

**Código completo:**

```1:100:lirandzo-backend/src/main/java/com/lirandzo/entity/Encomenda.java
package com.lirandzo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "encomendas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Encomenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "numero_encomenda")
    private Long numeroEncomenda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(nullable = false, length = 200)
    private String produto;

    @Column(nullable = false, length = 200)
    private String origem;

    @Column(nullable = false, length = 200)
    private String destino;

    @Column(name = "valor_total", nullable = false, precision = 15, scale = 2)
    private Double valorTotal;

    @Column(name = "valor_pago", precision = 15, scale = 2)
    private Double valorPago = 0.0;

    @Column(name = "valor_divida", precision = 15, scale = 2)
    private Double valorDivida = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusPagamento status = StatusPagamento.NAO_PAGO;

    @Column(name = "data_encomenda")
    private LocalDate dataEncomenda;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @OneToMany(mappedBy = "encomenda", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pagamento> pagamentos = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viagem_id")
    private Viagem viagem;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
        if (dataEncomenda == null) {
            dataEncomenda = LocalDate.now();
        }
        calcularDivida();
    }

    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
        calcularDivida();
    }

    private void calcularDivida() {
        if (valorTotal != null && valorPago != null) {
            valorDivida = Math.max(0.0, valorTotal - valorPago);
            if (valorDivida == 0.0 && valorPago >= valorTotal) {
                status = StatusPagamento.PAGO;
            } else if (valorPago > 0.0 && valorDivida > 0.0) {
                status = StatusPagamento.PARCIAL;
            } else {
                status = StatusPagamento.NAO_PAGO;
            }
        }
    }

    public enum StatusPagamento {
        PAGO, PARCIAL, NAO_PAGO
    }
}
```

**Explicação das partes chave:**

#### Campos Principais (linhas 20-49):

- **Linha 22:** `numeroEncomenda` - ID único da encomenda, gerado automaticamente
- **Linha 25-27:** `cliente` - Relação ManyToOne com Cliente (lazy loading para performance)
- **Linha 38-39:** `valorTotal` - Valor total da encomenda (obrigatório, precisão 15,2)
- **Linha 41-42:** `valorPago` - Soma de todos os pagamentos (inicializado com 0.0)
- **Linha 44-45:** `valorDivida` - Calculado automaticamente (valorTotal - valorPago)
- **Linha 47-49:** `status` - Enum que indica se está PAGO, PARCIAL ou NAO_PAGO

#### Relações (linhas 60-65):

- **Linha 60-61:** `pagamentos` - Lista de pagamentos (OneToMany, cascade ALL para auto-sincronização)
- **Linha 63-65:** `viagem` - Relação opcional com Viagem (pode ser associada depois)

#### Método Crítico: `calcularDivida()` (linhas 83-94)

**Código:**

```83:94:lirandzo-backend/src/main/java/com/lirandzo/entity/Encomenda.java
private void calcularDivida() {
    if (valorTotal != null && valorPago != null) {
        valorDivida = Math.max(0.0, valorTotal - valorPago);
        if (valorDivida == 0.0 && valorPago >= valorTotal) {
            status = StatusPagamento.PAGO;
        } else if (valorPago > 0.0 && valorDivida > 0.0) {
            status = StatusPagamento.PARCIAL;
        } else {
            status = StatusPagamento.NAO_PAGO;
        }
    }
}
```

**Como funciona:**

1. **Linha 84:** Verifica se `valorTotal` e `valorPago` não são nulos
2. **Linha 85:** Calcula `valorDivida = max(0, valorTotal - valorPago)` - garante que nunca seja negativo
3. **Linha 86-87:** Se dívida é 0 e valor pago >= total → Status = **PAGO**
4. **Linha 88-89:** Se há pagamento parcial (pago > 0 mas ainda há dívida) → Status = **PARCIAL**
5. **Linha 90-91:** Caso contrário (nenhum pagamento) → Status = **NAO_PAGO**

**Exemplo:**
- Encomenda: valorTotal = 1000, valorPago = 0 → valorDivida = 1000, status = NAO_PAGO
- Pagamento de 300 → valorPago = 300, valorDivida = 700, status = PARCIAL
- Pagamento de 700 → valorPago = 1000, valorDivida = 0, status = PAGO

#### Hooks JPA (linhas 67-81):

- **`@PrePersist` (linhas 67-75):** Executado ANTES de salvar pela primeira vez
  - Define `dataCriacao` e `dataAtualizacao` com data/hora atual
  - Se `dataEncomenda` for null, define como hoje
  - Chama `calcularDivida()` para calcular status inicial

- **`@PreUpdate` (linhas 77-81):** Executado ANTES de cada atualização
  - Atualiza `dataAtualizacao`
  - Recalcula dívida e status (importante quando valorPago muda)

### 2. EncomendaService

**Localização:** `lirandzo-backend/src/main/java/com/lirandzo/service/EncomendaService.java`

**Responsabilidade:** Lógica de negócio para gestão de encomendas, incluindo adição de pagamentos e atualização de estatísticas do cliente.

**Código completo:**

```1:119:lirandzo-backend/src/main/java/com/lirandzo/service/EncomendaService.java
package com.lirandzo.service;

import com.lirandzo.entity.Encomenda;
import com.lirandzo.entity.Encomenda.StatusPagamento;
import com.lirandzo.entity.Pagamento;
import com.lirandzo.repository.EncomendaRepository;
import com.lirandzo.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EncomendaService {

    @Autowired
    private EncomendaRepository encomendaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    public List<Encomenda> findAll(StatusPagamento status, LocalDate dataInicio, LocalDate dataFim) {
        if (status != null) {
            return encomendaRepository.findByStatus(status);
        }
        if (dataInicio != null && dataFim != null) {
            return encomendaRepository.findByDataEncomendaBetween(dataInicio, dataFim);
        }
        return encomendaRepository.findAll();
    }

    public Optional<Encomenda> findById(Long id) {
        return encomendaRepository.findById(id);
    }

    public Encomenda save(Encomenda encomenda) {
        Encomenda saved = encomendaRepository.save(encomenda);
        atualizarEstatisticasCliente(saved.getCliente().getId());
        return saved;
    }

    public Optional<Encomenda> update(Long id, Encomenda encomendaAtualizada) {
        return encomendaRepository.findById(id)
                .map(encomenda -> {
                    Long clienteIdAntigo = encomenda.getCliente().getId();
                    
                    encomenda.setCliente(encomendaAtualizada.getCliente());
                    encomenda.setProduto(encomendaAtualizada.getProduto());
                    encomenda.setOrigem(encomendaAtualizada.getOrigem());
                    encomenda.setDestino(encomendaAtualizada.getDestino());
                    encomenda.setValorTotal(encomendaAtualizada.getValorTotal());
                    encomenda.setValorPago(encomendaAtualizada.getValorPago());
                    encomenda.setDataEncomenda(encomendaAtualizada.getDataEncomenda());
                    
                    Encomenda saved = encomendaRepository.save(encomenda);
                    
                    atualizarEstatisticasCliente(clienteIdAntigo);
                    if (!clienteIdAntigo.equals(saved.getCliente().getId())) {
                        atualizarEstatisticasCliente(saved.getCliente().getId());
                    }
                    
                    return saved;
                });
    }

    public void deleteById(Long id) {
        encomendaRepository.findById(id).ifPresent(encomenda -> {
            Long clienteId = encomenda.getCliente().getId();
            encomendaRepository.deleteById(id);
            atualizarEstatisticasCliente(clienteId);
        });
    }

    public List<Encomenda> findByClienteId(Long clienteId) {
        return encomendaRepository.findByClienteId(clienteId);
    }

    public Optional<Encomenda> adicionarPagamento(Long id, Double valor) {
        return encomendaRepository.findById(id)
                .map(encomenda -> {
                    Pagamento pagamento = new Pagamento();
                    pagamento.setEncomenda(encomenda);
                    pagamento.setValor(valor);
                    
                    encomenda.getPagamentos().add(pagamento);
                    encomenda.setValorPago(encomenda.getValorPago() + valor);
                    
                    Encomenda saved = encomendaRepository.save(encomenda);
                    atualizarEstatisticasCliente(saved.getCliente().getId());
                    
                    return saved;
                });
    }

    private void atualizarEstatisticasCliente(Long clienteId) {
        clienteRepository.findById(clienteId).ifPresent(cliente -> {
            List<Encomenda> encomendas = encomendaRepository.findByClienteId(clienteId);
            
            double valorTotalFaturado = encomendas.stream()
                    .mapToDouble(e -> e.getValorTotal() != null ? e.getValorTotal() : 0.0)
                    .sum();
            
            double valorEmDivida = encomendas.stream()
                    .mapToDouble(e -> e.getValorDivida() != null ? e.getValorDivida() : 0.0)
                    .sum();
            
            cliente.setValorTotalFaturado(valorTotalFaturado);
            cliente.setValorEmDivida(valorEmDivida);
            cliente.setNumeroEncomendas(encomendas.size());
            
            clienteRepository.save(cliente);
        });
    }
}
```

**Métodos principais:**

#### Método: `adicionarPagamento()` (linhas 82-97)

**Código:**

```82:97:lirandzo-backend/src/main/java/com/lirandzo/service/EncomendaService.java
public Optional<Encomenda> adicionarPagamento(Long id, Double valor) {
    return encomendaRepository.findById(id)
            .map(encomenda -> {
                Pagamento pagamento = new Pagamento();
                pagamento.setEncomenda(encomenda);
                pagamento.setValor(valor);
                
                encomenda.getPagamentos().add(pagamento);
                encomenda.setValorPago(encomenda.getValorPago() + valor);
                
                Encomenda saved = encomendaRepository.save(encomenda);
                atualizarEstatisticasCliente(saved.getCliente().getId());
                
                return saved;
            });
}
```

**Como funciona:**

1. **Linha 83:** Busca a encomenda pelo ID (retorna Optional)
2. **Linha 84-87:** Se encontrada, cria novo Pagamento e associa à encomenda
3. **Linha 89:** Adiciona o pagamento à lista de pagamentos da encomenda
4. **Linha 90:** **CRÍTICO:** Incrementa `valorPago` com o novo valor
   - Isso dispara `@PreUpdate` na entidade Encomenda
   - Que chama `calcularDivida()` automaticamente
   - Que atualiza `valorDivida` e `status`
5. **Linha 92:** Salva a encomenda (com todos os cálculos automáticos)
6. **Linha 93:** Atualiza estatísticas do cliente (valorTotalFaturado, valorEmDivida, numeroEncomendas)
7. **Linha 95:** Retorna a encomenda atualizada

**Exemplo de uso:**
```java
// Adicionar pagamento de 500 a uma encomenda de 1000
encomendaService.adicionarPagamento(1L, 500.0);
// Resultado: valorPago = 500, valorDivida = 500, status = PARCIAL
```

#### Método: `atualizarEstatisticasCliente()` (linhas 99-117)

**Código:**

```99:117:lirandzo-backend/src/main/java/com/lirandzo/service/EncomendaService.java
private void atualizarEstatisticasCliente(Long clienteId) {
    clienteRepository.findById(clienteId).ifPresent(cliente -> {
        List<Encomenda> encomendas = encomendaRepository.findByClienteId(clienteId);
        
        double valorTotalFaturado = encomendas.stream()
                .mapToDouble(e -> e.getValorTotal() != null ? e.getValorTotal() : 0.0)
                .sum();
        
        double valorEmDivida = encomendas.stream()
                .mapToDouble(e -> e.getValorDivida() != null ? e.getValorDivida() : 0.0)
                .sum();
        
        cliente.setValorTotalFaturado(valorTotalFaturado);
        cliente.setValorEmDivida(valorEmDivida);
        cliente.setNumeroEncomendas(encomendas.size());
        
        clienteRepository.save(cliente);
    });
}
```

**Como funciona:**

1. **Linha 100:** Busca o cliente pelo ID
2. **Linha 101:** Busca todas as encomendas deste cliente
3. **Linhas 103-105:** Calcula `valorTotalFaturado` somando todos os `valorTotal` das encomendas
4. **Linhas 107-109:** Calcula `valorEmDivida` somando todos os `valorDivida` das encomendas
5. **Linhas 111-113:** Atualiza as estatísticas do cliente
6. **Linha 115:** Salva o cliente atualizado

**Quando é chamado:**
- Após criar nova encomenda (`save()`)
- Após atualizar encomenda (`update()`)
- Após eliminar encomenda (`deleteById()`)
- Após adicionar pagamento (`adicionarPagamento()`)

## Fluxo de Execução

### Cenário 1: Criar Encomenda

1. **Entrada:** JSON com dados da encomenda
2. **Processamento:**
   - Controller recebe request → `EncomendaController.createEncomenda()`
   - Service salva → `EncomendaService.save()`
   - JPA executa `@PrePersist` → calcula dívida e status
   - Service atualiza estatísticas do cliente
3. **Saída:** Encomenda criada com status NAO_PAGO

**Código do fluxo:**

```40:43:lirandzo-backend/src/main/java/com/lirandzo/service/EncomendaService.java
public Encomenda save(Encomenda encomenda) {
    Encomenda saved = encomendaRepository.save(encomenda);
    atualizarEstatisticasCliente(saved.getCliente().getId());
    return saved;
}
```

### Cenário 2: Adicionar Pagamento

1. **Entrada:** ID da encomenda + valor do pagamento
2. **Processamento:**
   - Service busca encomenda
   - Cria novo Pagamento
   - Incrementa `valorPago`
   - JPA executa `@PreUpdate` → recalcula dívida e status
   - Atualiza estatísticas do cliente
3. **Saída:** Encomenda atualizada com novo status

## Lógica de Negócio

### Regra 1: Cálculo Automático de Dívida

**Onde está implementada:** `Encomenda.calcularDivida()` (linhas 83-94)

**Regra:**
- Dívida = max(0, valorTotal - valorPago)
- Status = PAGO se dívida = 0 e valorPago >= valorTotal
- Status = PARCIAL se valorPago > 0 mas dívida > 0
- Status = NAO_PAGO se valorPago = 0

**Exemplo:**
```
Encomenda: valorTotal = 1000
- Pagamento 0 → dívida = 1000, status = NAO_PAGO
- Pagamento 300 → dívida = 700, status = PARCIAL
- Pagamento 700 → dívida = 0, status = PAGO
```

### Regra 2: Atualização Automática de Estatísticas

**Onde está implementada:** `EncomendaService.atualizarEstatisticasCliente()` (linhas 99-117)

**Regra:**
- Sempre que uma encomenda é criada/atualizada/eliminada
- Recalcula estatísticas do cliente:
  - valorTotalFaturado = soma de todos os valorTotal
  - valorEmDivida = soma de todos os valorDivida
  - numeroEncomendas = contagem de encomendas

## Integrações

### Com Cliente

**Onde:** `Encomenda.cliente` (linha 25-27)

**Código:**

```25:27:lirandzo-backend/src/main/java/com/lirandzo/entity/Encomenda.java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "cliente_id", nullable = false)
private Cliente cliente;
```

**Como funciona:**
- Relação ManyToOne (muitas encomendas para um cliente)
- Lazy loading (carrega cliente apenas quando acessado)
- Obrigatório (nullable = false)

### Com Pagamento

**Onde:** `Encomenda.pagamentos` (linha 60-61)

**Código:**

```60:61:lirandzo-backend/src/main/java/com/lirandzo/entity/Encomenda.java
@OneToMany(mappedBy = "encomenda", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Pagamento> pagamentos = new ArrayList<>();
```

**Como funciona:**
- Relação OneToMany (uma encomenda tem muitos pagamentos)
- Cascade ALL: operações na encomenda afetam pagamentos
- orphanRemoval: se encomenda for eliminada, pagamentos também são

## Impacto

### Antes:
- Não havia sistema de encomendas
- Não havia rastreamento de pagamentos
- Não havia cálculo automático de dívidas

### Depois:
- Sistema completo de encomendas
- Cálculo automático de dívidas e status
- Estatísticas automáticas dos clientes
- Integração com sistema de pagamentos

## Como usar

### Exemplo 1: Criar Encomenda

**Request:**
```http
POST /api/encomendas
Content-Type: application/json

{
  "cliente": {"id": 1},
  "produto": "Cimento",
  "origem": "Maputo",
  "destino": "Beira",
  "valorTotal": 50000.00
}
```

**Response:**
```json
{
  "numeroEncomenda": 1,
  "valorTotal": 50000.00,
  "valorPago": 0.0,
  "valorDivida": 50000.00,
  "status": "NAO_PAGO"
}
```

### Exemplo 2: Adicionar Pagamento

**Request:**
```http
POST /api/encomendas/1/pagamento
Content-Type: application/json

25000.00
```

**Response:**
```json
{
  "numeroEncomenda": 1,
  "valorTotal": 50000.00,
  "valorPago": 25000.00,
  "valorDivida": 25000.00,
  "status": "PARCIAL"
}
```

## Próximos passos

- [ ] Adicionar validação para evitar pagamentos maiores que a dívida
- [ ] Implementar histórico de pagamentos
- [ ] Adicionar notificações quando encomenda é paga
- [ ] Implementar relatórios de encomendas

## Referências

- Ver `Documentacao/Funcionalidades/` para outras funcionalidades relacionadas
- Ver `lirandzo-backend/src/main/java/com/lirandzo/entity/Cliente.java` para entidade Cliente
- Ver `lirandzo-backend/src/main/java/com/lirandzo/entity/Pagamento.java` para entidade Pagamento

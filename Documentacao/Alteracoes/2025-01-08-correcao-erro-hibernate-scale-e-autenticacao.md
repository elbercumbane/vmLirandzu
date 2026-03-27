# Correção: Erro Hibernate "scale has no meaning" e Autenticação PostgreSQL

**Data:** 2025-01-08  
**Tipo:** Correção de Erro  
**Prioridade:** Crítica

## O que falhou

### Erro 1: Autenticação PostgreSQL
```
FATAL: password authentication failed for user "postgres"
```

### Erro 2: Hibernate Scale
```
scale has no meaning for floating point numbers
```

## Onde foi modificado

### Ficheiros modificados:
- `lirandzo-backend/src/main/java/com/lirandzo/entity/Cliente.java`
- `lirandzo-backend/src/main/java/com/lirandzo/entity/Encomenda.java`
- `lirandzo-backend/src/main/java/com/lirandzo/entity/Pagamento.java`
- `lirandzo-backend/src/main/java/com/lirandzo/entity/Motorista.java`
- `lirandzo-backend/src/main/java/com/lirandzo/entity/Viatura.java`
- `lirandzo-backend/src/main/java/com/lirandzo/entity/Viagem.java`

## Porquê falhou

### Problema 1: Autenticação PostgreSQL

**Causa:**
- Senha do PostgreSQL no Docker pode não estar configurada corretamente
- Ou senha diferente da configurada em `application.properties`

**Solução:**
- Alterar senha do usuário postgres no PostgreSQL para corresponder à configuração

### Problema 2: Hibernate Scale com Double

**Causa:**
- No Hibernate 6.x, quando usamos tipos `Double` ou `Float` (tipos primitivos de ponto flutuante Java), não podemos usar `precision` e `scale` diretamente na anotação `@Column`
- Hibernate interpreta `Double` como tipo de ponto flutuante, onde `scale` não tem significado
- Para DECIMAL no PostgreSQL, precisamos usar `columnDefinition` explicitamente

**Código ANTES (incorreto):**

```java
@Column(name = "valor_total", nullable = false, precision = 15, scale = 2)
private Double valorTotal;
```

**Problema:** Hibernate 6.x não aceita `scale` com `Double`

## Como foi corrigido

### Correção 1: Autenticação PostgreSQL

**Comando executado:**
```bash
docker exec lirandzo-postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

**O que faz:**
- Altera senha do usuário `postgres` para `postgres`
- Garante que corresponde à configuração em `application.properties`

### Correção 2: Entidades JPA

**Código DEPOIS (correto):**

**Cliente.java:**
```java
// ANTES
@Column(name = "valor_total_faturado", precision = 15, scale = 2)
private Double valorTotalFaturado = 0.0;

// DEPOIS
@Column(name = "valor_total_faturado", columnDefinition = "DECIMAL(15,2)")
private Double valorTotalFaturado = 0.0;
```

**Encomenda.java:**
```java
// ANTES
@Column(name = "valor_total", nullable = false, precision = 15, scale = 2)
private Double valorTotal;

// DEPOIS
@Column(name = "valor_total", nullable = false, columnDefinition = "DECIMAL(15,2)")
private Double valorTotal;
```

**Pagamento.java:**
```java
// ANTES
@Column(nullable = false, precision = 15, scale = 2)
private Double valor;

// DEPOIS
@Column(nullable = false, columnDefinition = "DECIMAL(15,2)")
private Double valor;
```

**Motorista.java:**
```java
// ANTES
@Column(name = "avaliacao_media", precision = 3, scale = 2)
private Double avaliacaoMedia = 0.0;

// DEPOIS
@Column(name = "avaliacao_media", columnDefinition = "DECIMAL(3,2)")
private Double avaliacaoMedia = 0.0;
```

**Viatura.java:**
```java
// ANTES
@Column(precision = 10, scale = 2)
private Double capacidade;

// DEPOIS
@Column(columnDefinition = "DECIMAL(10,2)")
private Double capacidade;
```

**Viagem.java:**
```java
// ANTES
@Column(name = "combustivel_consumido", precision = 10, scale = 2)
private Double combustivelConsumido;

@Column(name = "custo_combustivel", precision = 15, scale = 2)
private Double custoCombustivel;

// DEPOIS
@Column(name = "combustivel_consumido", columnDefinition = "DECIMAL(10,2)")
private Double combustivelConsumido;

@Column(name = "custo_combustivel", columnDefinition = "DECIMAL(15,2)")
private Double custoCombustivel;
```

## Explicação Técnica

### Por que `columnDefinition` funciona?

**`columnDefinition = "DECIMAL(15,2)"`:**
- Define explicitamente o tipo SQL da coluna
- Hibernate usa esta definição diretamente, sem interpretar o tipo Java
- Funciona com `Double`, `Float`, `BigDecimal`, etc.

**`precision` e `scale` separados:**
- Hibernate tenta inferir o tipo SQL baseado no tipo Java
- Com `Double`, Hibernate assume tipo de ponto flutuante (FLOAT/REAL)
- Em tipos de ponto flutuante, `scale` não tem significado
- Por isso o erro: "scale has no meaning for floating point numbers"

### Alternativas

**Opção 1: Usar `columnDefinition` (escolhida)**
```java
@Column(columnDefinition = "DECIMAL(15,2)")
private Double valor;
```
✅ Funciona com qualquer tipo Java  
✅ Controle total sobre tipo SQL

**Opção 2: Usar `BigDecimal`**
```java
@Column(precision = 15, scale = 2)
private BigDecimal valor;
```
✅ `precision` e `scale` funcionam  
❌ Requer mudança de tipo em todo o código

**Opção 3: Remover `scale`**
```java
@Column(precision = 15)
private Double valor;
```
❌ Perde precisão decimal (não recomendado)

## Impacto

### Antes:
- ❌ Backend não iniciava
- ❌ Erro de autenticação PostgreSQL
- ❌ Erro Hibernate ao criar tabelas

### Depois:
- ✅ Backend inicia corretamente
- ✅ Autenticação PostgreSQL funcionando
- ✅ Tabelas criadas com DECIMAL corretamente
- ✅ Precisão decimal mantida (2 casas decimais)

## Testes

Após correção, verificar:

1. **Backend inicia:**
```bash
mvn spring-boot:run
```

2. **Sem erros de Hibernate:**
- Verificar logs: não deve aparecer "scale has no meaning"

3. **Tabelas criadas corretamente:**
```bash
docker exec lirandzo-postgres psql -U postgres -d lirandzo_db -c "\d clientes"
```

4. **Colunas DECIMAL corretas:**
- Deve mostrar: `valor_total_faturado | numeric(15,2)`

## Referências

- [Hibernate 6 Migration Guide](https://hibernate.org/community/documentation/)
- [JPA Column Definition](https://docs.oracle.com/javaee/7/api/javax/persistence/Column.html#columnDefinition--)

# Guia de Documentação com Código

**Data:** 2025-01-08  
**Versão:** 1.0

## Introdução

Este guia explica como documentar funcionalidades e alterações incluindo código das partes chave, explicações detalhadas e rastreamento de mudanças.

## Princípios da Documentação

### 1. Sempre Incluir Código

Toda documentação de funcionalidade ou alteração significativa DEVE incluir:
- Código das partes principais
- Explicação linha por linha quando necessário
- Exemplos de uso

### 2. Documentar Alterações Detalhadamente

Quando alterar código existente, documente:
- **Código ANTES** (o que estava)
- **Código DEPOIS** (o que ficou)
- **O que mudou:** X foi trocado por Y
- **Porquê mudou:** Motivo da alteração
- **Resultado:** O que isso resolve/provoca
- **Impacto:** Como afeta outras partes

### 3. Explicar Lógica Complexa

Para lógica de negócio complexa:
- Explicar passo a passo como funciona
- Dar exemplos práticos
- Mostrar diferentes cenários

## Formato de Referência de Código

### Para Código Existente no Projeto

Use referências de código com formato: `startLine:endLine:filepath`

```12:25:lirandzo-backend/src/main/java/com/lirandzo/controller/ClienteController.java
@GetMapping
public ResponseEntity<List<Cliente>> getAllClientes() {
    return ResponseEntity.ok(clienteService.findAll());
}
```

**Vantagens:**
- Link direto para o código no editor
- Atualiza automaticamente se o código mudar
- Mostra contexto completo

### Para Código Novo ou Proposto

Use blocos de código normais com linguagem:

```java
// Código novo que será implementado
public void novaFuncionalidade() {
    // implementação
}
```

## Estrutura de Documentação de Funcionalidade

### 1. Cabeçalho
- Data
- Tipo
- Prioridade
- Componente

### 2. O que foi feito
- Descrição breve

### 3. Onde foi implementado
- Lista de ficheiros com linhas específicas

### 4. Porquê foi implementado
- Necessidade de negócio
- Solução escolhida

### 5. Código das Partes Chave
- **Para cada classe/componente principal:**
  - Localização
  - Responsabilidade
  - Código completo (usando referência)
  - Explicação linha por linha
  - Métodos principais explicados

### 6. Fluxo de Execução
- Cenários com código relevante

### 7. Lógica de Negócio
- Regras explicadas com código

### 8. Impacto
- Antes vs Depois

## Estrutura de Documentação de Alteração

### 1. Cabeçalho
- Data
- Tipo (Alteração/Correção)
- Prioridade

### 2. O que foi feito
- Descrição da alteração

### 3. Onde foi modificado
- Ficheiros com linhas específicas

### 4. Porquê foi modificado
- Problema identificado
- Solução

### 5. Código das Alterações

**Para cada alteração:**

#### Código ANTES
```startLine:endLine:ficheiro.java
// código antigo
```

#### Código DEPOIS
```startLine:endLine:ficheiro.java
// código novo
```

#### Detalhes da Mudança
- **O que foi alterado:** X → Y
- **Onde:** Linha X do ficheiro Y
- **Porquê:** Motivo
- **Resultado:** O que resolve
- **Impacto:** Como afeta outras partes

### 6. Código Relevante
- Partes que não mudaram mas são importantes para entender

## Exemplos Práticos

### Exemplo 1: Documentar Nova Funcionalidade

Ver: `Documentacao/Funcionalidades/2025-01-08-gestao-encomendas-com-pagamentos.md`

Este exemplo mostra:
- Código completo da entidade Encomenda
- Explicação linha por linha dos campos importantes
- Explicação detalhada do método `calcularDivida()`
- Fluxo de execução com código
- Exemplos práticos de uso

### Exemplo 2: Documentar Alteração

**Cenário:** Alterar método de cálculo de dívida

#### Código ANTES:
```83:94:lirandzo-backend/src/main/java/com/lirandzo/entity/Encomenda.java
private void calcularDivida() {
    valorDivida = valorTotal - valorPago;
    if (valorDivida <= 0) {
        status = StatusPagamento.PAGO;
    } else {
        status = StatusPagamento.NAO_PAGO;
    }
}
```

**Problema:** Não tratava pagamentos parciais corretamente.

#### Código DEPOIS:
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

**Detalhes da Mudança:**
- **O que foi alterado:** 
  - Adicionada verificação de null (linha 84)
  - Adicionado `Math.max(0.0, ...)` para evitar valores negativos (linha 85)
  - Adicionado status PARCIAL (linhas 88-89)
  - Melhorada lógica de determinação de status (linhas 86-91)
- **Onde:** Linhas 83-94 de `Encomenda.java`
- **Porquê:** 
  - Evitar NullPointerException
  - Suportar pagamentos parciais
  - Garantir que dívida nunca seja negativa
- **Resultado:** 
  - Sistema agora diferencia entre PAGO, PARCIAL e NAO_PAGO corretamente
  - Trata casos edge (null, valores negativos)
- **Impacto:** 
  - Frontend pode mostrar status PARCIAL
  - Relatórios agora mostram pagamentos parciais corretamente
  - Estatísticas de clientes mais precisas

## Boas Práticas

### 1. Seja Específico
❌ "Alterado método de cálculo"  
✅ "Alterado método `calcularDivida()` em `Encomenda.java` (linhas 83-94) para suportar pagamentos parciais"

### 2. Mostre Código Real
❌ "O método calcula a dívida"  
✅ Mostre o código e explique linha por linha

### 3. Explique o Porquê
Sempre explique:
- Porquê foi necessário fazer a alteração
- Porquê esta solução foi escolhida
- Porquê este código funciona

### 4. Mostre Impacto
Explique:
- O que mudou no comportamento
- Como afeta outras partes do sistema
- O que os utilizadores vão notar

### 5. Dê Exemplos
Sempre inclua:
- Exemplos de uso
- Exemplos de entrada/saída
- Casos de teste

## Templates Disponíveis

1. **TEMPLATE-funcionalidade.md** - Para novas funcionalidades
2. **TEMPLATE-alteracao.md** - Para alterações e correções

Copie o template apropriado e preencha com:
- Código real do projeto
- Explicações detalhadas
- Exemplos práticos

## Checklist de Documentação

Antes de considerar uma documentação completa, verifique:

- [ ] Código das partes principais incluído
- [ ] Explicação de como funciona
- [ ] Exemplos de uso
- [ ] Se é alteração: código ANTES e DEPOIS
- [ ] Detalhes da mudança (o que, onde, porquê, resultado)
- [ ] Impacto explicado
- [ ] Referências a outros ficheiros relevantes

## Ferramentas Úteis

### Para Referências de Código
Use o formato: `startLine:endLine:filepath`

### Para Buscar Código
Use `codebase_search` ou `grep` para encontrar código relevante antes de documentar.

### Para Ler Ficheiros
Use `read_file` para ler ficheiros completos antes de documentar.

## Conclusão

A documentação com código é essencial para:
- Manter conhecimento do sistema
- Facilitar manutenção futura
- Onboarding de novos desenvolvedores
- Rastreamento de decisões técnicas

Sempre que fizer alterações significativas ou adicionar funcionalidades, documente com código explicado seguindo este guia.

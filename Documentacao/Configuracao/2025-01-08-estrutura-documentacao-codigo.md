# Estrutura de Documentação com Código

**Data:** 2025-01-08  
**Tipo:** Configuração/Melhoria  
**Prioridade:** Alta

## O que foi feito

Criação de estrutura completa de documentação que inclui código das partes chave, explicações detalhadas e rastreamento de alterações de código.

## Onde foi modificado

### Ficheiros criados:
- `Documentacao/README.md` - Atualizado com guia de documentação com código
- `Documentacao/TEMPLATE-funcionalidade.md` - Template para documentar funcionalidades com código
- `Documentacao/TEMPLATE-alteracao.md` - Atualizado com seções de código ANTES/DEPOIS
- `Documentacao/guia-documentacao-codigo.md` - Guia completo de como documentar com código
- `Documentacao/Funcionalidades/2025-01-08-gestao-encomendas-com-pagamentos.md` - Exemplo completo de documentação com código

### Ficheiros modificados:
- `Documentacao/README.md` - Adicionadas seções sobre documentação de código

## Porquê foi modificado

**Problema identificado:**
- Documentação não incluía código das partes chave
- Não havia forma de rastrear alterações de código (o que mudou, de X para Y)
- Faltava explicação detalhada de como as funcionalidades funcionam
- Difícil entender decisões técnicas sem ver o código

**Solução:**
- Criar templates que obrigam inclusão de código
- Formato padronizado para mostrar código ANTES e DEPOIS
- Seções específicas para explicar código linha por linha
- Exemplo completo de documentação para referência

## Como foi implementado

### 1. Atualização do README da Documentação

**Código ANTES:**
```markdown
## Como Documentar

Sempre que fizer uma alteração:
1. Crie um ficheiro markdown
2. Inclua: O que foi feito, Onde, Porquê, Como
```

**Código DEPOIS:**
```markdown
## Como Documentar

Sempre que fizer uma alteração:
1. Crie um ficheiro markdown
2. **OBRIGATÓRIO:** Inclua código das partes chave
3. Inclua: O que foi feito, Onde, Porquê, Como, Código, Alterações

## Documentação de Código

### Formato para código:
- Use referências de código para código existente
- Use blocos normais para código novo
- Sempre explique código complexo linha por linha
```

**O que mudou:**
- Adicionada obrigatoriedade de incluir código
- Adicionada seção completa sobre documentação de código
- Adicionados exemplos de formato

### 2. Criação de Template para Funcionalidades

**Ficheiro:** `Documentacao/TEMPLATE-funcionalidade.md`

**Estrutura criada:**
- Seção "Código das Partes Chave" obrigatória
- Subsecções para cada classe/componente:
  - Localização
  - Responsabilidade
  - Código completo (com referência)
  - Explicação linha por linha
  - Métodos principais explicados
- Seção "Fluxo de Execução" com código
- Seção "Lógica de Negócio" com código

**Porquê esta estrutura:**
- Força a inclusão de código
- Organiza explicações de forma clara
- Facilita encontrar informações específicas

### 3. Atualização de Template para Alterações

**Ficheiro:** `Documentacao/TEMPLATE-alteracao.md`

**Código ANTES:**
```markdown
## Como foi implementado
[Passos técnicos]

### Código relevante:
```linguagem
// Exemplo
```
```

**Código DEPOIS:**
```markdown
## Código das Alterações

### Alteração 1: [Nome]

#### Código ANTES (o que estava):
```startLine:endLine:ficheiro.java
// código antigo
```

#### Código DEPOIS (o que ficou):
```startLine:endLine:ficheiro.java
// código novo
```

#### Detalhes da Mudança:
- O que foi alterado: X → Y
- Onde: Linha X do ficheiro Y
- Porquê: Motivo
- Resultado: O que resolve
- Impacto: Como afeta outras partes
```

**O que mudou:**
- Estrutura obrigatória para mostrar código ANTES e DEPOIS
- Seção detalhada de mudanças (o que, onde, porquê, resultado, impacto)
- Formato padronizado para rastreamento de alterações

### 4. Criação de Guia Completo

**Ficheiro:** `Documentacao/guia-documentacao-codigo.md`

**Conteúdo:**
- Princípios da documentação
- Formato de referência de código
- Estrutura de documentação
- Exemplos práticos
- Boas práticas
- Checklist

**Porquê:**
- Referência central para como documentar
- Exemplos práticos para seguir
- Padronização de formato

### 5. Exemplo Completo de Documentação

**Ficheiro:** `Documentacao/Funcionalidades/2025-01-08-gestao-encomendas-com-pagamentos.md`

**Conteúdo:**
- Documentação completa da funcionalidade de encomendas
- Código completo da entidade Encomenda
- Explicação linha por linha dos campos importantes
- Explicação detalhada do método `calcularDivida()`
- Explicação do método `adicionarPagamento()` no service
- Fluxos de execução com código
- Exemplos práticos de uso

**Porquê:**
- Serve como referência de como documentar
- Mostra nível de detalhe esperado
- Demonstra formato correto

## Detalhes da Implementação

### Formato de Referência de Código

**Padrão adotado:**
```
```startLine:endLine:filepath
// código aqui
```
```

**Exemplo:**
```
```83:94:lirandzo-backend/src/main/java/com/lirandzo/entity/Encomenda.java
private void calcularDivida() {
    // código
}
```
```

**Vantagens:**
- Link direto para código no editor
- Atualiza automaticamente se código mudar
- Mostra contexto completo

### Estrutura de Documentação de Alteração

**Padrão para cada alteração:**

1. **Código ANTES** - O que estava antes da mudança
2. **Código DEPOIS** - O que ficou após a mudança
3. **Detalhes da Mudança:**
   - O que foi alterado (X → Y)
   - Onde foi alterado (linha X do ficheiro Y)
   - Porquê foi alterado (motivo)
   - Resultado (o que resolve/provoca)
   - Impacto (como afeta outras partes)

**Exemplo prático:**

**Código ANTES:**
```java
private void calcularDivida() {
    valorDivida = valorTotal - valorPago;
}
```

**Código DEPOIS:**
```java
private void calcularDivida() {
    valorDivida = Math.max(0.0, valorTotal - valorPago);
}
```

**Detalhes:**
- **O que:** `valorDivida = valorTotal - valorPago` → `valorDivida = Math.max(0.0, valorTotal - valorPago)`
- **Onde:** Linha 85 de `Encomenda.java`
- **Porquê:** Evitar valores negativos de dívida
- **Resultado:** Dívida nunca será negativa
- **Impacto:** Estatísticas de clientes sempre corretas

## Impacto

### Antes:
- ❌ Documentação sem código
- ❌ Difícil entender como funciona
- ❌ Impossível rastrear mudanças de código
- ❌ Decisões técnicas não documentadas

### Depois:
- ✅ Documentação obrigatória com código
- ✅ Código explicado linha por linha
- ✅ Rastreamento claro de alterações (X → Y)
- ✅ Decisões técnicas documentadas com código
- ✅ Templates padronizados
- ✅ Exemplo completo de referência

## Como usar

### Para Documentar Nova Funcionalidade:

1. Copiar `TEMPLATE-funcionalidade.md`
2. Preencher com código real usando referências
3. Explicar partes chave linha por linha
4. Incluir exemplos de uso

### Para Documentar Alteração:

1. Copiar `TEMPLATE-alteracao.md`
2. Mostrar código ANTES e DEPOIS
3. Detalhar mudança (o que, onde, porquê, resultado, impacto)
4. Incluir código relevante que não mudou

### Referência:

- Ver `guia-documentacao-codigo.md` para guia completo
- Ver `Funcionalidades/2025-01-08-gestao-encomendas-com-pagamentos.md` para exemplo

## Próximos passos

- [ ] Documentar funcionalidades existentes usando novo formato
- [ ] Criar mais exemplos de documentação de alterações
- [ ] Adicionar validação automática de documentação (se possível)

## Referências

- `Documentacao/README.md` - Guia principal
- `Documentacao/guia-documentacao-codigo.md` - Guia detalhado
- `Documentacao/TEMPLATE-funcionalidade.md` - Template para funcionalidades
- `Documentacao/TEMPLATE-alteracao.md` - Template para alterações

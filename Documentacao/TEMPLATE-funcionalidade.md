# [Nome da Funcionalidade]

**Data:** YYYY-MM-DD  
**Tipo:** Funcionalidade  
**Prioridade:** Baixa/Média/Alta/Crítica  
**Componente:** Backend/Frontend/Ambos

## O que foi feito

[Descrição breve e clara da funcionalidade implementada]

## Onde foi implementado

### Ficheiros criados:
- `caminho/para/ficheiro1.ext` (linhas X-Y)
- `caminho/para/ficheiro2.ext` (linhas A-B)

### Ficheiros modificados:
- `caminho/para/ficheiro-existente.ext` (linhas X-Y)
- `caminho/para/outro-ficheiro.ext` (linhas A-B)

## Porquê foi implementado

**Necessidade:**
[Descrever a necessidade de negócio ou requisito que motivou a implementação]

**Solução:**
[Descrever a solução implementada]

## Arquitectura da Funcionalidade

[Diagrama ou descrição de como a funcionalidade se integra no sistema]

```
[Fluxo ou diagrama se aplicável]
```

## Código das Partes Chave

### 1. [Nome da Classe/Componente Principal]

**Localização:** `caminho/para/Classe.java`

**Responsabilidade:** [O que esta classe faz]

**Código completo:**

```startLine:endLine:caminho/para/Classe.java
// Código completo da classe
```

**Explicação linha por linha:**

- **Linha X:** `@Annotation` - [Explicação do que faz]
- **Linha Y:** `private Tipo campo;` - [Explicação do campo]
- **Linha Z:** `public Metodo() { ... }` - [Explicação do método]

**Métodos principais:**

#### Método 1: `nomeDoMetodo()`

```startLine:endLine:caminho/para/Classe.java
public Tipo nomeDoMetodo() {
    // código do método
}
```

**Como funciona:**
1. Passo 1: [Explicação]
2. Passo 2: [Explicação]
3. Passo 3: [Explicação]

**Exemplo de uso:**
```java
// Exemplo de como usar este método
```

### 2. [Outra Classe/Componente]

[Repetir estrutura acima]

## Fluxo de Execução

### Cenário 1: [Nome do Cenário]

1. **Entrada:** [O que é recebido]
2. **Processamento:** 
   - [Passo 1 com código relevante]
   - [Passo 2 com código relevante]
3. **Saída:** [O que é retornado]

**Código do fluxo:**

```startLine:endLine:ficheiro.java
// Código que executa este fluxo
```

### Cenário 2: [Outro Cenário]

[Repetir estrutura acima]

## Lógica de Negócio

### Regra 1: [Nome da Regra]

**Onde está implementada:** `caminho/para/Classe.java` (linhas X-Y)

**Código:**

```startLine:endLine:caminho/para/Classe.java
// Código da regra
```

**Explicação:**
[Explicar a lógica da regra de negócio]

**Exemplo:**
```
Situação: [descrição]
Resultado: [o que acontece]
```

### Regra 2: [Outra Regra]

[Repetir estrutura acima]

## Integrações

### Com [Componente/API Externa]

**Onde:** `caminho/para/Classe.java` (linhas X-Y)

**Código:**

```startLine:endLine:caminho/para/Classe.java
// Código da integração
```

**Como funciona:**
[Explicação da integração]

## Validações

### Validação 1: [Nome]

**Onde:** `caminho/para/Classe.java` (linhas X-Y)

**Código:**

```startLine:endLine:caminho/para/Classe.java
// Código da validação
```

**Quando é executada:** [Quando]
**O que valida:** [O que]
**Erro retornado:** [Qual erro]

## Tratamento de Erros

### Erro 1: [Tipo de Erro]

**Onde é tratado:** `caminho/para/Classe.java` (linhas X-Y)

**Código:**

```startLine:endLine:caminho/para/Classe.java
// Código de tratamento
```

**Quando ocorre:** [Quando]
**Como é tratado:** [Como]

## Testes

### Teste 1: [Nome do Teste]

**O que testa:** [Descrição]

```java
@Test
public void testNomeDoTeste() {
    // código do teste
}
```

**Resultado esperado:** [O que deve acontecer]

## Impacto

### Antes:
[Estado anterior do sistema]

### Depois:
[Estado atual do sistema]

### Dependências:
- [ ] Requer alterações no frontend
- [ ] Requer alterações no backend
- [ ] Requer alterações na base de dados
- [ ] Requer migração de dados
- [ ] Requer atualização de documentação

## Como usar

### Exemplo 1: [Caso de uso]

**Request:**
```http
POST /api/endpoint
Content-Type: application/json

{
  "campo": "valor"
}
```

**Response:**
```json
{
  "resultado": "sucesso"
}
```

**Código que processa:**

```startLine:endLine:caminho/para/Controller.java
// Código do endpoint
```

## Próximos passos

- [ ] Melhoria futura relacionada
- [ ] Funcionalidade complementar

## Referências

- [Link para documentação externa]
- [Issue/Ticket relacionado]
- [Documentação relacionada no projeto]

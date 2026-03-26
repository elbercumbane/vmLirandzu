# Documentação do Projeto Lirandzo

Esta pasta contém toda a documentação técnica do projeto, incluindo alterações, novas funcionalidades, correções de erros e decisões de arquitectura.

## Estrutura

- **Alteracoes/** - Documentação de alterações e correções
- **Funcionalidades/** - Documentação de novas funcionalidades com código explicado
- **Arquitectura/** - Documentação de decisões de arquitectura
- **Configuracao/** - Documentação de configurações e setup

## Como Documentar

Sempre que fizer uma alteração, correção ou adicionar uma funcionalidade:

1. Crie um ficheiro markdown na pasta apropriada
2. Use o formato: `YYYY-MM-DD-descricao-curta.md`
3. **OBRIGATÓRIO:** Inclua código das partes chave explicadas
4. Inclua:
   - **O que foi feito**
   - **Onde foi modificado** (ficheiros/pastas com linhas específicas)
   - **Porquê foi modificado** (problema/resolução)
   - **Como foi implementado** (passos técnicos com código)
   - **Código das partes chave** (com explicação linha por linha)
   - **Alterações de código** (se aplicável: o que mudou, de X para Y, resultado)
   - **Impacto** (o que mudou no sistema)

## Documentação de Código

### Quando documentar código:

1. **Funcionalidades novas:** Sempre incluir código das partes principais
2. **Alterações significativas:** Mostrar código antes e depois
3. **Lógica complexa:** Explicar como funciona passo a passo
4. **Correções de bugs:** Mostrar o código problemático e a solução

### Formato para código:

Use referências de código quando mostrar código existente:

```12:25:lirandzo-backend/src/main/java/com/lirandzo/controller/ClienteController.java
@GetMapping
public ResponseEntity<List<Cliente>> getAllClientes() {
    return ResponseEntity.ok(clienteService.findAll());
}
```

Para código novo ou proposto, use blocos de código normais:

```java
// Exemplo de código novo
public void novaFuncionalidade() {
    // implementação
}
```

### Documentação de Alterações:

Quando alterar código existente, documente:

1. **Código ANTES (o que estava):**
```12:15:ficheiro-antigo.java
// código antigo
```

2. **Código DEPOIS (o que ficou):**
```12:18:ficheiro-novo.java
// código novo
```

3. **Explicação da mudança:**
   - O que foi alterado: `X` foi trocado por `Y`
   - Porquê: Motivo da alteração
   - Resultado: O que isso resolve/provoca
   - Impacto: Como afeta outras partes do sistema

## Templates Disponíveis

- `TEMPLATE-alteracao.md` - Para alterações e correções
- `TEMPLATE-funcionalidade.md` - Para novas funcionalidades com código

## Exemplo Completo

Ver `Funcionalidades/2025-01-08-gestao-encomendas-com-pagamentos.md` para um exemplo completo de documentação com código explicado.

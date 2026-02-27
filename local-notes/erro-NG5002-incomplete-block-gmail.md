## Erro NG5002 - Incomplete block "gmail"

- **Arquivo**: `src/app/components/cta/cta.component.ts`
- **Linha aproximada**: 39
- **Mensagem completa**:

```text
NG5002: Incomplete block "gmail". If you meant to write the @ character,
you should use the "&#64;" HTML entity instead.
```

### 1. O que causou o erro

- A partir das versões mais recentes do Angular (incluindo 19), o caractere `@` dentro do template
  passou a ser usado para os **novos blocos de controle** (`@if`, `@for`, etc.).
- No nosso template inline, havia o endereço de email:

```html
vm.liranzotransportes@gmail.com
```

- O compilador tentou interpretar `@gmail` como o início de um bloco de controle,
  por isso disse que o bloco `"gmail"` está incompleto.

### 2. Como identificar rapidamente

- A mensagem cita:
  - **\"Incomplete block \\\"gmail\\\"\"** → está vendo `@gmail` como bloco.
  - O arquivo e linha indicam exatamente onde está o texto com `@`.
- Sempre que aparecer erro NG5002 falando de **Incomplete block "algumaCoisa"**:
  - Procure por `@algumaCoisa` no template (inline ou em `.html`).

### 3. Como foi resolvido

- Substituímos o caractere `@` pela entidade HTML `&#64;`, como o próprio erro sugere.
- Mudanças principais:

```html
<!-- Antes -->
<a href="mailto:vm.liranzotransportes@gmail.com" ...>
...
<div class="contact-value">vm.liranzotransportes@gmail.com</div>

<!-- Depois -->
<a href="mailto:vm.liranzotransportes&#64;gmail.com" ...>
...
<div class="contact-value">vm.liranzotransportes&#64;gmail.com</div>
```

- Dessa forma, o compilador Angular não vê mais o `@` diretamente e o HTML continua mostrando o email normal.

### 4. Boas práticas para evitar esse erro no futuro

- Sempre que precisar escrever emails ou qualquer texto com `@` **dentro de template Angular**:
  - Use `&#64;` no lugar de `@`:

```html
meuemail&#64;dominio.com
```

- Isso vale tanto para:
  - conteúdo de `div`, `span`, etc.
  - atributos (`href="mailto:..."`, `title="..."`, etc.).


## Feature: Alternador de tema no navbar do portal (branch Elber)

- **Contexto**: Após o merge com a branch do Guilherme, o utilizador esperava ter um botão para mudar o tema (claro/escuro) directo no `navbar`, com fundo predominante branco.
- **Ficheiros alterados**:
  - `lirandzo-app/src/app/shared/navbar/navbar.component.ts`
  - `lirandzo-app/src/app/shared/navbar/navbar.component.html`
  - `lirandzo-app/src/app/shared/navbar/navbar.component.css`
- **Implementação**:
  - Injectado o `ThemeService` no `NavbarComponent` e exposto:
    - `isDarkTheme`: getter para saber se o tema actual é escuro.
    - `toggleTheme()`: chama `theme.toggle()` para alternar entre `dark` e `light`.
  - Adicionado um botão circular de **alternar tema** no `navbar`, ao lado do ícone de login:
    - Ícone de **lua** quando está em tema escuro.
    - Ícone de **sol** quando está em tema claro.
    - Usa `aria-label` dinâmico para acessibilidade.
  - Ajustado o CSS para `nav-login-wrap` e criado estilo `nav-theme-toggle` para combinar com o design existente (fundo claro, borda suave, hover azul).
- **Comportamento**:
  - Ao clicar no botão de tema, o `ThemeService` altera o atributo `data-theme` no `document.documentElement`, usando as variáveis CSS já definidas em `src/styles.css` (`[data-theme="dark"]` e `[data-theme="light"]`).
  - O fundo claro (`light`) passa a ser usado quando o utilizador alterna (tema em memória, sem localStorage).


## Ajuste: Navbar e tema visíveis em /login e /billing

- **Objectivo**: O utilizador quer ver o `navbar` (incluindo o botão de alternar tema) também na página de login e em todo o dashboard de billing.
- **Ficheiro alterado**:
  - `lirandzo-app/src/app/app.component.ts`
- **Mudança**:
  - Antes, a função `hideChrome` escondia o chrome (navbar + footer) para URLs que começassem com:
    - `/area-cliente`
    - `/billing`
    - `/login`
    - `/recuperar-senha`
  - Agora, `hideChrome` só esconde em:
    - `/area-cliente`
    - `/recuperar-senha`
  - Resultado: o `navbar` com o botão de tema e o footer aparecem normalmente nas rotas `/login` e em todas as rotas `/billing`.
- **Impacto**:
  - O utilizador consegue mudar o tema tanto na homepage como na página de login e dentro do módulo de facturação (`/billing`), mantendo a navegação consistente.


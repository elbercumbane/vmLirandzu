# Como Correr o Dashboard Novo do Guilherme

## ⚠️ IMPORTANTE: Deves correr o app dentro de `lirandzo-app`, NÃO na raiz!

### Passos para correr o dashboard novo:

1. **Abre o terminal e vai para a pasta correcta:**
   ```bash
   cd "C:\Users\Elber Elizio\Desktop\DAP PROJECTOS\vmLirandzu\lirandzo-app"
   ```

2. **Instala as dependências (se ainda não instalaste):**
   ```bash
   npm install
   ```

3. **Inicia o servidor Angular:**
   ```bash
   npm start
   ```

4. **Abre no browser:**
   - Vai para: `http://localhost:4200`
   - Faz login em: `http://localhost:4200/login`
   - Escolhe um perfil (Admin/Gestor/Técnico)
   - Serás redireccionado para: `http://localhost:4200/billing`
   - **Aqui deves ver o dashboard novo** com:
     - KPIs (Total Encomendas, Receita do Mês, Total de Viagens, etc.)
     - Gráficos de Receitas vs Despesas
     - Gráfico de Viagens por Viatura
     - Listas de Clientes em Dívida e Motoristas Destaque

### Se ainda vês o dashboard antigo:

1. **Limpa o cache do browser:**
   - Pressiona `Ctrl + Shift + Delete`
   - Ou abre em modo incógnito: `Ctrl + Shift + N`

2. **Reinicia o servidor Angular:**
   - Para o servidor (Ctrl+C)
   - Limpa cache do Angular: `Remove-Item -Recurse -Force .angular`
   - Volta a correr: `npm start`

3. **Verifica que estás na porta certa:**
   - O dashboard novo corre em `http://localhost:4200` (dentro de `lirandzo-app`)
   - Se tiveres outro app a correr na raiz, pode estar noutra porta (ex: `4201`)

### Estrutura correcta:

- ✅ **CORRECTO**: `lirandzo-app/src/app/features/billing/dashboard/billing-dashboard.component.ts` → Dashboard novo
- ❌ **ERRADO**: Correr `npm start` na raiz `vmLirandzu` → Isso corre o app antigo

### Rotas do dashboard novo:

- `/billing` → Carrega `BillingLayoutComponent` que mostra sidebar + navbar + `<router-outlet>`
- `/billing` (vazio) → Carrega `BillingDashboardComponent` (dashboard novo com KPIs e gráficos)
- `/billing/encomendas` → Lista de encomendas
- `/billing/viaturas` → Lista de viaturas
- etc.

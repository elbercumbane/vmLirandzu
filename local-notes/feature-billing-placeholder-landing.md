## 🔧 Placeholder - Sistema de Gestão de Facturas dentro do portal `lirandzo-app`

- **Data**: 2026-02-25
- **Contexto**: O sistema de facturação antigo foi descartado. Vamos reconstruir, passo a passo, directamente dentro do projecto `lirandzo-app`, usando o mesmo visual do portal público.

### O que foi feito

- **Removido** o código dos componentes antigos de facturação do projecto `vmLirandzu`:
  - `src/app/billing/layout/billing-layout.component.ts`
  - `src/app/billing/dashboard/dashboard.component.ts`
  - `src/app/billing/orders/orders.component.ts`
  - `src/app/billing/new-order/new-order.component.ts`
  - `src/app/billing/trips/trips.component.ts`
  - `src/app/billing/customers/customers.component.ts`
  - `src/app/billing/payments/payments.component.ts`
  - `src/app/billing/reports/reports.component.ts`
  - `src/app/billing/settings/settings.component.ts`

- **Criado** um novo componente de entrada de facturação dentro do portal `lirandzo-app`:
  - `lirandzo/lirandzo-app/src/app/features/billing-admin/billing-admin.component.ts`
  - `billing-admin.component.html` e `billing-admin.component.css`

### Detalhes visuais

- O componente `/billing` agora:
  - Usa um **background em tela cheia** com a **mesma foto principal** do hero do portal (imagem de camião/rodovia do Unsplash).
  - Aplica um **overlay em degradê escuro**, igual ao estilo do hero, para dar contraste.
  - Mostra apenas o texto:
    - **Título**: `Sistema de Gestão de Facturas`
    - **Subtítulo**: breve descrição de backoffice interno.

### Rotas

- O ficheiro `lirandzo/lirandzo-app/src/app/app.routes.ts` foi actualizado:
  - `/billing` agora carrega o componente `BillingAdminComponent` (placeholder simples).
  - A estrutura antiga com `billing/layout` e filhos (`dashboard`, `orders`, etc.) foi removida das rotas.

### Próximos passos (futuros)

- Adicionar, passo a passo, as funcionalidades internas de facturação:
  - Dashboard interno.
  - Gestão de encomendas.
  - Registo de pagamentos.
  - Guias de viagem.
  - Relatórios.


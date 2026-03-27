## Visão Geral do Sistema de Billing (Estado Actual da branch `Elber` = `guilherme_lirandzo`)

Este documento descreve, em linguagem natural, **como está construído** o módulo de billing/facturação dentro do portal `lirandzo-app`.  
O objectivo é poderes colar este texto numa outra LLM para pedir sugestões de UX, melhorias de dados, etc.

---

## 1. Arquitectura geral do billing

- O portal principal é o `lirandzo-app` (Angular 19, standalone components).
- As rotas de billing estão em `src/app/app.routes.ts`, dentro do grupo:
  - `path: 'billing'` → carrega `BillingLayoutComponent` (shell do backoffice).
  - Dentro desse layout existe um `router-outlet` onde cada página de billing é carregada.
- O layout de billing é composto por:
  - **Sidebar de navegação** (`BillingSidebarComponent`) fixa do lado esquerdo.
  - **Dashboard navbar** (`DashboardNavbarComponent`) no topo da área principal.
  - Área de conteúdo com `router-outlet` para cada secção (Dashboard, Encomendas, Clientes, etc.).
- Todo o look & feel do billing usa um sistema de **tema claro/escuro** baseado em CSS variables, controlado por `ThemeService` e pelos atributos `data-theme="dark|light"` no `<html>`.

---

## 2. Layout principal (`BillingLayoutComponent`)

- Estrutura:
  - `<app-billing-sidebar>`: menu lateral com as secções de billing.
  - `<app-dashboard-navbar>`: barra superior com informação do utilizador, data/hora, idioma, notificações, etc.
  - `<main class="billing-main">`: área central onde entram as páginas (`router-outlet`).
- O componente controla um booleano `sidebarOpen` para abrir/fechar a sidebar.
  - A sidebar também mostra badges com contagens (ex.: nº de encomendas ativas, nº de dívidas).
- Visualmente, a área principal:
  - Fundo em cor clara (no tema light) com cartões brancos e sombras suaves.
  - Conteúdo centralizado com margens laterais, seguindo o mesmo padrão do dashboard de exemplo (cards com KPIs no topo, cards grandes com gráficos/tabelas em baixo).

---

## 3. Sidebar de Billing (`BillingSidebarComponent`)

- Fica fixa à esquerda, com:
  - Logo e nome do sistema.
  - Indicação do utilizador (perfil/Admin).
  - Menu principal com grupos:
    - **Dashboard** (rota `/billing`).
    - **Operações**:
      - Encomendas (`/billing/encomendas`)
      - Cotações (`/billing/cotacoes`)
      - Viagens (`/billing/viagens`)
      - Guias de Remessa (`/billing/guias`)
    - **Cadastros**:
      - Clientes (`/billing/clientes`)
      - Viaturas (`/billing/viaturas`)
      - Motoristas (`/billing/motoristas`)
    - **Financeiro**:
      - Tesouraria (`/billing/tesouraria`)
      - Relatórios (`/billing/relatorios`)
    - **Sistema**:
      - Configurações (`/billing/configuracoes`)
  - Alguns itens têm **badges** dinâmicos:
    - Ex.: valor de dívidas em aberto, nº de encomendas activas, etc.
- O componente lê dados de um "store" (`vmStore`) para calcular estes números e actualizar o menu.

---

## 4. Navbar do dashboard (`DashboardNavbarComponent`)

- Barra horizontal no topo da área principal com:
  - Botão para abrir/fechar a sidebar.
  - Identidade da empresa (logo/nome).
  - Informação contextual:
    - Data e hora actual.
    - Idioma actual (PT/EN).
  - Ações rápidas:
    - Botão para voltar ao portal público.
    - Ícones para notificações, ajuda, utilizador, etc. (estilo SaaS moderno).
- A navbar ajuda a dar contexto de que o utilizador está dentro de um **backoffice de gestão de frota/facturação**.

---

## 5. Dashboard principal (`/billing` → `BillingDashboardComponent`)

### 5.1. KPIs de topo

- Primeira linha mostra 5 cartões de KPIs:
  1. **Total Encomendas**  
     - Número fixo (ex.: 47) representando encomendas do mês.
  2. **Receita do Mês**  
     - Valor em MZN (ex.: 285.400 MZN) com um texto “+33% vs mês anterior”.
  3. **Total de Viagens**  
     - Número total de viagens (ex.: 39, com indicação de quantas estão em curso).
  4. **Gasto Combustível**  
     - Valor consumido de combustível em MZN e litros (ex.: 102.500 MZN, 1.345 litros).
  5. **Motorista Destaque**  
     - Nome do motorista com melhor performance (ex.: “Mário Tembe”, 51 viagens, nota 4.9).
  6. **Clientes em Dívida**  
     - Número de clientes em dívida e o total em MZN.

### 5.2. Gráfico de Receitas vs Despesas

- Card grande com gráfico de barras verticais para os últimos 4 meses (Out, Nov, Dez, Jan).
- Cada mês tem duas barras:
  - Receita.
  - Despesa.
- Altura das barras é calculada em função do maior valor para manter proporções visuais.

### 5.3. Gráfico de Viagens por Viatura

- Card lateral com barras horizontais coloridas para:
  - Volvo FH16, Scania R450, Iveco Stralis, Isuzu NPR, Mercedes Actros.
- Mostra nº de viagens por viatura, destacando a viatura mais usada com barra mais comprida.

### 5.4. Clientes em Dívida (alertas)

- Card de alertas com lista de clientes:
  - Nome, telefone, valor em dívida, nº de dias em atraso.
- Ajuda a identificar rapidamente quem precisa de follow-up da tesouraria.

### 5.5. Motoristas Destaque

- Card com "top 3" motoristas:
  - Nome, nº de viagens, avaliação média.
- Serve para destacar performance operacional (gamificação básica).

---

## 6. Encomendas (`/billing/encomendas`)

### 6.1. Cabeçalho e KPIs

- Cabeçalho com título **“Encomendas”** e botão **“Nova Encomenda”**.
- Linha de KPIs:
  1. **Total Encomendas**: quantidade total registada e quantas estão visíveis após filtros.
  2. **Valor Facturado**: soma dos valores de todas as encomendas.
  3. **Total em Dívida**: soma dos valores em dívida em todas as encomendas.
  4. **Taxa de Pagamento**: percentagem de encomendas com status “PAGO”.

### 6.2. Filtros e pesquisa

- Barra de ferramentas (`toolbar`) com:
  - Campo de pesquisa por nº de encomenda, cliente ou produto.
  - Chips de filtro por estado:
    - TODOS / PAGO / PARCIAL / NÃO PAGO.

### 6.3. Tabela de encomendas

- Tabela responsiva com colunas:
  - Nº Encomenda, Cliente, Telefone, Produto, Origem, Destino,
    Valor Total, Pago, Dívida, Status, Data.
- Status e dívidas são destacados com cores (ex.: perigo para “NÃO PAGO”).
- A fonte de dados é um array fixo de encomendas representando um cenário de Janeiro 2025.

### 6.4. Nova encomenda (`/billing/encomendas/nova`)

- Formulário em formato de cartão com campos:
  - Dados do cliente (nome, contacto).
  - Origem/destino, produto, valor, estado de pagamento.
- A lógica actual é mais de **mock/UX** (não grava em backend), focando em mostrar como seria o fluxo de registo.

---

## 7. Clientes (`/billing/clientes`)

- Página de lista com:
  - Cabeçalho “Clientes”.
  - KPIs relacionados com número de clientes activos, em dívida, etc.
  - Tabela com:
    - Nome, contacto, nº de encomendas, valor total facturado, valor em dívida.
- Serve como visão 360º dos clientes ligados às encomendas.
- A versão actual usa dados estáticos representativos, não backend real.

---

## 8. Viaturas (`/billing/viaturas` e filhos)

### 8.1. Lista de viaturas (`/billing/viaturas`)

- Lista de viaturas com:
  - Identificação, matrícula, tipo, capacidade, estado (activo/em manutenção).
- KPIs:
  - Nº de viaturas activas.
  - Nº em manutenção.
  - Capacidade total da frota.

### 8.2. Cadastro de viaturas (`/billing/viaturas/nova`)

- Formulário para registar uma nova viatura:
  - Marca/modelo, matrícula, tipo (camião, reboque, etc.), capacidade, estado.

### 8.3. Categorias e estado (`/billing/viaturas/categorias`, `/billing/viaturas/estado`)

- Páginas auxiliares para:
  - Categorias de viatura (por tipo de carga).
  - Estado/condição das viaturas (pronta, oficina, reservada, etc.).
- Actualmente focam mais no UI do que em lógica complexa.

---

## 9. Motoristas (`/billing/motoristas`)

### 9.1. Lista (`/billing/motoristas`)

- Tabela com:
  - Nome do motorista, nº de viagens, avaliação média, estado (activo/inactivo).
- KPIs:
  - Motoristas activos.
  - Motoristas destacados (melhores avaliações).

### 9.2. Cadastro (`/billing/motoristas/novo`)

- Formulário para adicionar um motorista:
  - Nome, contacto, nº de carta, experiência, etc.
- Objectivo é ter uma base de recursos humanos ligada à frota.

---

## 10. Viagens (`/billing/viagens`)

### 10.1. Lista (`/billing/viagens`)

- Lista de viagens com:
  - ID da viagem, motorista, viatura, origem/destino, datas, estado (planeada/em curso/concluída).
- KPIs:
  - Nº de viagens realizadas no período.
  - Viagens em curso / planeadas.

### 10.2. Nova viagem (`/billing/viagens/nova`)

- Formulário para planear uma nova viagem:
  - Seleccionar motorista e viatura.
  - Definir origem, destino, datas previstas.
  - Eventual ligação futura a encomendas específicas.

---

## 11. Guias de Remessa (`/billing/guias`)

- Lista de guias de remessa, ligada a encomendas e viagens:
  - Nº da guia, cliente, destino, data, estado.
- Versão actual é um mock com dados estáticos, mas já com estrutura para futura ligação a PDFs e emissão oficial.
- Página de **nova guia** (`/billing/guias/nova`) com formulário semelhante.

---

## 12. Tesouraria (`/billing/tesouraria`)

### 12.1. KPIs de topo

- Cartões:
  - **Total Recebido** no mês.
  - **Total Despesas** no mês.
  - **Saldo do Mês** (receitas − despesas).
  - **Dívidas Pendentes**.

### 12.2. Tabs de detalhe

- Três separadores principais:
  1. **Recebimentos**:
     - Tabela com data, cliente, referência, valor.
     - Formulário em linha para registar um novo recebimento.
  2. **Despesas**:
     - Tabela com data, categoria, descrição, valor.
     - Formulário para registar uma despesa.
  3. **Dívidas**:
     - Lista de clientes e valores pendentes, com possibilidade de marcação de recebimento.

- Os dados são mantidos em arrays no próprio componente (simulação), mas o fluxo de UX já está montado como se houvesse backend por trás.

---

## 13. Relatórios (`/billing/relatorios`)

### 13.1. Cabeçalho e ajuda

- Header com:
  - Título **“Relatórios & Exportação”**.
  - Subtítulo explicativo (análise financeira e operacional).
  - Botão **Voltar** (para `/billing`).
  - Botão **Ajuda** que abre um popup com instruções de uso da página.

### 13.2. Secção de filtros

- Card de filtros com:
  - Botão para expandir/recolher a zona de filtros.
  - Seleção de **período**:
    - Este mês, Mês anterior, Últimos 3 meses, Este ano, Personalizado.
  - Campos de datas “De/Até” para o modo personalizado.
  - Botões (em potencial) para exportação (PDF, CSV, etc.).
- Quando o utilizador altera o período, a função `applyPeriod()` apenas ajusta o texto do período actual (demo), mas está preparado para no futuro filtrar dados reais.

### 13.3. KPIs e gráfico de evolução mensal

- KPIs:
  - Facturado, Recebido, Dívida total, Nº de encomendas, Ticket médio, Taxa de recebimento.
- Gráfico de linhas:
  - Três séries: Facturado, Recebido, Dívida.
  - Usa `<svg>` manualmente com `polyline` para desenhar as linhas em função dos dados de cada mês.

### 13.4. Tabelas detalhadas

- **Tabela de dívidas por cliente**:
  - Cliente, telefone, nº de encomendas com dívida, valor total, data mais antiga.
- **Tabela por gestor**:
  - Gestor, nº encomendas, facturado, recebido, dívida, taxa de recebimento, nº de viagens.
- **Tabela por viagem**:
  - ID da viagem, gestor, período, nº de encomendas, valor transportado, recebido, a receber, estado.

---

## 14. Configurações (`/billing/configuracoes`)

- Página protegida por `configuracoesGuard`.
- Ainda focada em layout/UI para:
  - Parâmetros de negócio (ex.: moeda, definições de IVA, prazos).
  - Preferências de notificação.
  - Possíveis integrações futuras (ex.: ERPs, bancos).

---

## 15. Temas, cores e consistência visual

- Todas as páginas de billing partilham:
  - **CSS base** em `billing/shared/billing-page.css`:
    - `page-header`, `kpi-grid`, `kpi-card`, `card`, `toolbar`, `filter-chip`, `data-table`, etc.
  - **Variáveis de tema** definidas em `src/styles.css`:
    - Para dark e light: `--bg-page`, `--bg-card`, `--text-primary`, `--accent`, etc.
- O resultado é um **layout consistente**:
  - Mesmo espaçamento entre cartões.
  - Mesma tipografia e pesos de fonte.
  - Mesma linguagem visual em todos os módulos (encomendas, clientes, viaturas, motoristas, viagens, tesouraria, relatórios).


## Feature: Página simples de Histórico do Cliente (billing)

- **Rota**: `/billing/clientes/historico` dentro do layout de billing.
- **Componentes principais**:
  - `cliente-historico.component.ts/html/css` em `features/billing/clientes`.
  - Usa o mesmo layout do restante billing: `billing-page.css` e `BillingSectionHeaderComponent` (barra laranja com VM, título, subtítulo, Voltar/Ajuda).
- **Funcionalidade** (mock, sem store real, focado em simplicidade):
  - Select no topo para escolher um **cliente** (lista fixa baseada nos mesmos nomes usados em Clientes, Encomendas e Cotações).
  - Mostra um **resumo do cliente** (nome, contacto, telefone, província) com um "pill" da província.
  - KPIs para o cliente seleccionado:
    - Nº de encomendas.
    - Total facturado (soma dos totais das encomendas).
    - Total em dívida (soma das dívidas das encomendas).
    - Nº de cotações.
  - Duas tabelas, lado a lado (responsivo):
    - **Encomendas do Cliente**: nº, data, produto, origem, destino, total, pago, dívida, status.
    - **Cotações do Cliente**: ref, data, estado, origem, destino, descrição da carga.
- **Integração com Clientes**:
  - Em `clientes-lista.component.html` foi adicionado um botão **“Ver Histórico por Cliente”** que navega para a nova rota de histórico.
- **Notas**:
  - Todos os dados ainda são **mock** (arrays locais) reutilizando valores dos componentes de Encomendas e Cotações para manter coerência.
  - O objectivo é fornecer uma vista consolidada e simples para análise de clientes, sem complicar com store/backend neste momento.


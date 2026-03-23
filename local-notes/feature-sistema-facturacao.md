# 🚛 Sistema de Facturação - VM Lirandzu Transportes

> Atualização: O portal público foi removido. A aplicação agora contém apenas o sistema de gestão de facturas (módulo `billing`) e o projeto clonado `lirandzo` dentro da pasta `lirandzo/`.

## Data de Criação
{{ data atual }}

## O Que Foi Criado

Foi criado um sistema completo de facturação integrado no mesmo projeto Angular, mas separado do portal público através de rotas.

## Estrutura Criada

### 1. **Modelos de Dados** (`src/app/models/`)
- `encomenda.model.ts` - Modelo completo de encomendas com produtos, pagamentos, status
- `cliente.model.ts` - Modelo de clientes com histórico
- `viagem.model.ts` - Modelo de guias de viagem com conferência
- `config.model.ts` - Configurações da empresa e utilizadores

### 2. **Serviços** (`src/app/services/`)
- Dados obtidos via API (sem localStorage)
- `encomenda.service.ts` - Lógica de negócio para encomendas (criação, cálculos, status)

### 3. **Componentes Principais** (`src/app/facturacao/`)
- `layout/facturacao-layout.component.ts` - Layout principal com sidebar fixa de 260px
- `dashboard/dashboard.component.ts` - Dashboard com KPIs, gráficos e alertas
- `encomendas/encomendas.component.ts` - Listagem completa com filtros avançados
- `nova-encomenda/nova-encomenda.component.ts` - Formulário completo em 4 secções
- `viagens/viagens.component.ts` - Placeholder (em desenvolvimento)
- `clientes/clientes.component.ts` - Placeholder (em desenvolvimento)
- `pagamentos/pagamentos.component.ts` - Placeholder (em desenvolvimento)
- `relatorios/relatorios.component.ts` - Placeholder (em desenvolvimento)
- `configuracoes/configuracoes.component.ts` - Placeholder (em desenvolvimento)

### 4. **Rotas** (`src/app/app.routes.ts`)
- `/facturacao` - Layout principal
- `/facturacao` - Dashboard (rota padrão)
- `/facturacao/encomendas` - Listagem de encomendas
- `/facturacao/nova-encomenda` - Criar nova encomenda
- `/facturacao/viagens` - Guias de viagem
- `/facturacao/clientes` - Gestão de clientes
- `/facturacao/pagamentos` - Recibos e pagamentos
- `/facturacao/relatorios` - Relatórios
- `/facturacao/configuracoes` - Configurações

## Funcionalidades Implementadas

### ✅ Dashboard
- KPIs em cards: Total encomendas mês, valores facturados/recebidos/dívida
- Status cards: Pagas, Parciais, Não Pagas (com percentagens)
- Gráfico de barras: Encomendas por semana (últimas 4 semanas)
- Gráfico de pizza: Distribuição de pagamentos
- Lista das 5 últimas encomendas
- Alertas para encomendas com mais de 7 dias sem pagamento

### ✅ Encomendas
- Tabela completa com todas as colunas solicitadas
- Filtros: Status, Data início/fim, Pesquisa por nome/Nº encomenda
- Acções: Ver, Editar, Emitir PDF, Marcar Pago (placeholders)
- Status badges coloridos
- Layout responsivo com scroll horizontal em mobile

### ✅ Nova Encomenda
- **Secção A**: Dados do cliente (nome, telefone, email, NIF, endereço)
- **Secção B**: Múltiplos produtos (nome, loja, quantidade, valor ZAR, descrição, link)
- **Secção C**: Custos e pagamento (taxa transporte, câmbio, valor total, entrada, forma pagamento)
- **Secção D**: Viagem/Guia (datas previstas, observações)
- Cálculos automáticos: Valor total, saldo em dívida
- Validação de campos obrigatórios
- Numeração automática: VML-AAAA-NNNN

## Paleta de Cores Aplicada

- **Navy principal**: #0A1628 (sidebar, headers)
- **Navy cards**: #112240 (cards, tabelas)
- **Navy borders**: #1E3A5F (bordas)
- **Laranja primário**: #F97316 (botões, acções)
- **Laranja hover**: #FB923C
- **Azul accent**: #1E6FBF (links secundários)
- **Texto principal**: #E8EDF5
- **Texto secundário**: #6B84A3
- **Verde (pago)**: #22C55E
- **Amarelo (parcial)**: #EAB308
- **Vermelho (não pago)**: #EF4444
- **Fundo geral**: #060E1B

## Layout Full Width

- Sidebar fixa de 260px à esquerda
- Área de conteúdo ocupa 100% do espaço restante
- Grid: `grid-template-columns: 260px 1fr`
- Header fixo no topo da área de conteúdo
- Responsivo: sidebar colapsa em mobile

## Dependências Adicionadas

- `tailwindcss` - Framework CSS utilitário
- `date-fns` - Manipulação de datas
- `jspdf` - Geração de PDFs (para implementar)

## Como Acessar

1. Portal público: `http://localhost:4200/`
2. Sistema de facturação: `http://localhost:4200/facturacao`

## Próximos Passos (Para Implementar)

1. **Guias de Viagem**: Vista de conferência mobile-friendly
2. **Clientes**: Gestão completa com histórico
3. **Pagamentos**: Registar pagamentos parciais/totais
4. **Relatórios**: Exportar PDF/Excel
5. **Configurações**: Dados empresa, taxas, utilizadores
6. **Geração PDF**: Facturas em PDF com logo e formatação
7. **Backup/Restore**: Exportar/importar dados

## Notas Técnicas

- Dados obtidos via API do backend
- Todos os cálculos são automáticos (status, dívida, totais)
- Numeração de encomendas sequencial por ano
- Formulários com validação em tempo real
- Design dark mode consistente
- Componentes standalone (Angular 19)

## Como Identificar Problemas

- **Erro de rota**: Verificar `app.routes.ts` e imports dos componentes
- **Dados não aparecem**: Verificar se o backend está em execução e a ligação à API
- **Cálculos errados**: Verificar `encomenda.service.ts` métodos de cálculo
- **Estilos não aplicam**: Verificar se Tailwind está configurado corretamente

## Como Resolver Problemas Comuns

1. **Componente não carrega**: Verificar se está importado em `app.routes.ts`
2. **Dados não persistem**: Verificar se `StorageService` está a guardar corretamente
3. **Cores não aparecem**: Verificar `tailwind.config.js` e rebuild do projeto
4. **Formulário não submete**: Verificar validações e campos obrigatórios

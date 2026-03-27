# Refatoração: Português → Inglês no Código

## Data
{{ data atual }}

## O Que Foi Feito

Refatoração completa de todo o código do sistema de facturação para usar **nomes em inglês** em classes, interfaces, serviços, variáveis, métodos e ficheiros. Apenas os **textos visíveis ao utilizador** permanecem em português.

## Mudanças Realizadas

### Modelos
- `encomenda.model.ts` → `order.model.ts`
  - `Encomenda` → `Order`
  - `StatusEncomenda` → `OrderStatus`
  - `Produto` → `Product`
  - `Pagamento` → `Payment`
  - `FormaPagamento` → `PaymentMethod`

- `cliente.model.ts` → `customer.model.ts`
  - `Cliente` → `Customer`
  - `ClienteComHistorico` → `CustomerWithHistory`

- `viagem.model.ts` → `trip.model.ts`
  - `Viagem` → `Trip`
  - `StatusViagem` → `TripStatus`
  - `StatusConferencia` → `CheckStatus`
  - `ItemConferencia` → `CheckItem`

- `config.model.ts` (mantido nome)
  - `Configuracao` → `Configuration`
  - `Utilizador` → `User`

### Serviços
- `encomenda.service.ts` → `order.service.ts`
  - `EncomendaService` → `OrderService`
  - Métodos refatorados:
    - `gerarNumeroEncomenda()` → `generateOrderNumber()`
    - `calcularValorTotal()` → `calculateTotalValue()`
    - `calcularStatus()` → `calculateStatus()`
    - `getAllEncomendas()` → `getAllOrders()`
    - `getEncomendaById()` → `getOrderById()`
    - `criarEncomenda()` → `createOrder()`
    - `actualizarEncomenda()` → `updateOrder()`
    - `adicionarPagamento()` → `addPayment()`
    - `cancelarEncomenda()` → `cancelOrder()`

- `storage.service.ts` (refatorado)
  - `getEncomendas()` → `getOrders()`
  - `saveEncomendas()` → `saveOrders()`
  - `getClientes()` → `getCustomers()`
  - `saveClientes()` → `saveCustomers()`
  - `getViagens()` → `getTrips()`
  - `saveViagens()` → `saveTrips()`
  - `getConfig()` → mantido
  - `saveConfig()` → mantido

### Componentes e Pastas
- `facturacao/` → `billing/`
  - `facturacao-layout.component.ts` → `billing-layout.component.ts`
  - `FacturacaoLayoutComponent` → `BillingLayoutComponent`
  - `dashboard.component.ts` → mantido (já estava em inglês)
  - `encomendas.component.ts` → `orders.component.ts`
  - `EncomendasComponent` → `OrdersComponent`
  - `nova-encomenda.component.ts` → `new-order.component.ts`
  - `NovaEncomendaComponent` → `NewOrderComponent`
  - `viagens.component.ts` → `trips.component.ts`
  - `ViagensComponent` → `TripsComponent`
  - `clientes.component.ts` → `customers.component.ts`
  - `ClientesComponent` → `CustomersComponent`
  - `pagamentos.component.ts` → `payments.component.ts`
  - `PagamentosComponent` → `PaymentsComponent`
  - `relatorios.component.ts` → `reports.component.ts`
  - `RelatoriosComponent` → `ReportsComponent`
  - `configuracoes.component.ts` → `settings.component.ts`
  - `ConfiguracoesComponent` → `SettingsComponent`

### Rotas
- `/facturacao` → `/billing`
  - `/facturacao/encomendas` → `/billing/orders`
  - `/facturacao/nova-encomenda` → `/billing/new-order`
  - `/facturacao/viagens` → `/billing/trips`
  - `/facturacao/clientes` → `/billing/customers`
  - `/facturacao/pagamentos` → `/billing/pay
ments`
  - `/facturacao/relatorios` → `/billing/reports`
  - `/facturacao/configuracoes` → `/billing/settings`

- Adicionado redirect de `/facturacao` → `/billing` para compatibilidade

### Propriedades e Variáveis
Todas as propriedades dos modelos foram refatoradas:
- `numeroEncomenda` → `orderNumber`
- `dataRegisto` → `registrationDate`
- `nomeCliente` → `customerName`
- `telefoneCliente` → `customerPhone`
- `emailCliente` → `customerEmail`
- `produtos` → `products`
- `taxaTransporte` → `transportFee`
- `cambioZAR_MZN` → `exchangeRateZAR_MZN`
- `valorTotalMZN` → `totalValueMZN`
- `valorPago` → `paidAmount`
- `saldoDivida` → `debtBalance`
- `viagemId` → `tripId`
- `dataPrevistaIda` → `expectedDepartureDate`
- `dataPrevistaRetorno` → `expectedReturnDate`
- `gestorResponsavel` → `responsibleManager`
- `pagamentos` → `payments`
- `dataUltimaActualizacao` → `lastUpdateDate`

## Como Identificar Problemas

- **Erro de import**: Verificar se os imports estão usando os novos nomes
- **Erro de propriedade**: Verificar se as propriedades foram atualizadas
- **Rota não funciona**: Verificar se está usando `/billing` em vez de `/facturacao`

## Como Resolver

1. **Atualizar imports**: Trocar todos os imports de modelos antigos para novos
2. **Atualizar propriedades**: Usar os novos nomes de propriedades
3. **Atualizar rotas**: Usar `/billing` em vez de `/facturacao`
4. **Rebuild**: Fazer `ng serve` novamente para recompilar

## Status

✅ Modelos refatorados
✅ Serviços refatorados  
✅ Layout e Dashboard refatorados
⏳ Componentes restantes (Orders, NewOrder, etc.) - em progresso

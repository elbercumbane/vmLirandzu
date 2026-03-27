# Integração Lista de Encomendas com API

**Data:** 2025-01-08  
**Tipo:** Funcionalidade Frontend  
**Status:** ✅ Implementado

## O que foi feito

Modificado o componente de lista de encomendas para buscar dados reais da base de dados em vez de usar dados fictícios.

### Funcionalidades:

1. ✅ Busca encomendas da API ao carregar componente
2. ✅ Mapeia dados da API para formato de exibição
3. ✅ Mantém filtros e pesquisa funcionando
4. ✅ Atualiza KPIs com dados reais
5. ✅ Mostra estados de loading e erro
6. ✅ Formatação de números, datas e status

## Modificações

### 1. EncomendasListaComponent
**Localização:** `lirandzo-app/src/app/features/billing/encomendas/encomendas-lista.component.ts`

**Mudanças:**
- Removidos dados fictícios hardcoded
- Adicionado `OnInit` lifecycle hook
- Implementado método `carregarEncomendas()` que chama API
- Criado método `mapearEncomenda()` para transformar dados da API
- Adicionados estados `loading` e `error`
- Mantidos filtros e pesquisa funcionando

**Mapeamento de Dados:**
- `numeroEncomenda` → `numero` (formatado como `VML-{numero}`)
- `cliente.nome` → `cliente`
- `cliente.telefone` → `telefone`
- `produto` → `produto`
- `origem` → `origem`
- `destino` → `destino`
- `valorTotal` → `total`
- `valorPago` → `pago`
- `valorDivida` → `divida`
- `status` → `status` (mapeado para PAGO/PARCIAL/NÃO PAGO)
- `dataEncomenda` → `data` (formatada em pt-MZ)

### 2. Template HTML
**Localização:** `lirandzo-app/src/app/features/billing/encomendas/encomendas-lista.component.html`

**Mudanças:**
- Adicionado estado de loading
- Adicionado estado de erro com botão de retry
- Mantida estrutura de tabela existente
- Mensagem atualizada quando não há encomendas

### 3. Estilos CSS
**Localização:** `lirandzo-app/src/app/features/billing/encomendas/encomendas-lista.component.css`

**Adicionado:**
- Estilos para `.loading-state`
- Estilos para `.error-state`
- Estilos para `.empty-state`

## Formato de Dados da API

### Request
```typescript
GET /api/encomendas
```

### Response
```typescript
interface EncomendaResponse {
  numeroEncomenda: number;
  cliente: {
    id: number;
    nome: string;
    telefone?: string;
    email?: string;
    endereco?: string;
  };
  produto: string;
  origem: string;
  destino: string;
  valorTotal: number;
  valorPago: number;
  valorDivida: number;
  status: string; // 'PAGO', 'PARCIAL', 'NÃO_PAGO'
  dataEncomenda: string; // ISO date string
}
```

## Mapeamento de Status

| API Status | Display Status |
|------------|----------------|
| `PAGO` | `PAGO` |
| `PARCIAL` | `PARCIAL` |
| `NÃO_PAGO` ou outros | `NÃO PAGO` |

## Formatação

### Número de Encomenda
- Formato: `VML-{numeroEncomenda}`
- Exemplo: `VML-1`, `VML-123`

### Data
- Formato: `DD/MM/YYYY`
- Locale: `pt-MZ`
- Exemplo: `09/01/2025`

### Valores Monetários
- Formato: `{valor} MZN`
- Sem casas decimais
- Exemplo: `45200 MZN`

## Estados do Componente

### Loading
- Mostra mensagem "A carregar encomendas da base de dados..."
- Aparece enquanto busca dados da API

### Error
- Mostra mensagem de erro
- Botão "Tentar Novamente" para retry
- Mantém array vazio

### Empty
- Mostra quando não há encomendas após filtros
- Mensagem: "Nenhuma encomenda encontrada na base de dados."

### Success
- Mostra tabela com encomendas
- KPIs atualizados com dados reais

## KPIs Atualizados

Todos os KPIs agora usam dados reais:
- **Total Encomendas:** `encomendas.length`
- **Valor Facturado:** Soma de `valorTotal`
- **Total em Dívida:** Soma de `valorDivida`
- **Taxa de Pagamento:** Percentagem de encomendas com status PAGO

## Filtros Mantidos

- **Todos:** Mostra todas as encomendas
- **Pago:** Filtra por status PAGO
- **Parcial:** Filtra por status PARCIAL
- **Não Pago:** Filtra por status NÃO PAGO

## Pesquisa

Pesquisa funciona em:
- Número de encomenda
- Nome do cliente
- Produto
- Origem
- Destino

## Próximos Passos (Opcional)

- [ ] Adicionar paginação para muitas encomendas
- [ ] Adicionar ordenação por colunas
- [ ] Adicionar refresh automático
- [ ] Adicionar exportação para Excel/PDF
- [ ] Adicionar filtros avançados (por data, valor, etc.)

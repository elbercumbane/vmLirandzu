# Implementação CRUD Completo para Viagens e Guias de Remessa

**Data:** 2025-01-08  
**Autor:** Sistema de Desenvolvimento  
**Versão:** 1.0

## Resumo

Este documento descreve a implementação completa do CRUD (Create, Read, Update, Delete) para **Viagens** e **Guias de Remessa**, incluindo integração com a base de dados PostgreSQL, preview de PDFs e funcionalidades de visualização e edição.

---

## 1. Viagens - Funcionalidades Implementadas

### 1.1 Guardar Viagem
- **Componente:** `viagens-cadastro.component.ts`
- **Funcionalidade:** Permite criar novas viagens e guardar na base de dados
- **Integração:** 
  - Busca motoristas da API via `MotoristaService`
  - Busca viaturas da API via `ViaturaService`
  - Cria viagem via `ViagemService.criarViagem()`
- **Validações:** Origem e destino obrigatórios
- **Notificações:** Popup de sucesso/erro após guardar

### 1.2 Visualizar Viagens
- **Componente:** `viagens-lista.component.ts`
- **Funcionalidade:** Lista todas as viagens da base de dados
- **Características:**
  - Carrega dados dinamicamente da API
  - Filtros por status (Todos, Em Curso, Concluída, Agendada)
  - Pesquisa por código ou motorista
  - KPIs: Total viagens, KM percorridos, Combustível gasto, Custo total
  - Estados de loading e error handling

### 1.3 Detalhe de Viagem
- **Componente:** `viagens-detalhe.component.ts` (NOVO)
- **Funcionalidade:** Visualiza detalhes completos de uma viagem específica
- **Informações exibidas:**
  - Atribuição (Motorista, Viatura)
  - Rota (Origem, Destino, Datas)
  - Estatísticas (Combustível, Custo, Status)
- **Navegação:** Botão "Editar" para editar a viagem

### 1.4 Editar Viagem
- **Componente:** `viagens-editar.component.ts` (NOVO)
- **Funcionalidade:** Permite editar uma viagem existente e guardar alterações
- **Características:**
  - Carrega dados existentes da API
  - Permite alterar motorista, viatura, rota, datas, status
  - Permite atualizar dados de combustível e custos
  - Validações antes de guardar
  - Redireciona para detalhe após guardar com sucesso

---

## 2. Guias de Remessa - Funcionalidades Implementadas

### 2.1 Remover Dados Fictícios e Buscar da Base de Dados
- **Componente:** `guias-lista.component.ts`
- **Alterações:**
  - Removidos dados hardcoded (6 guias fictícias)
  - Implementado `carregarGuias()` que busca da API via `GuiaRemessaService`
  - Estados de loading e error handling
  - Mapeamento de status da API para display (EM_TRANSITO → EM TRÂNSITO)

### 2.2 Guardar Guias
- **Componente:** `guias-cadastro.component.ts`
- **Funcionalidade:** Permite criar novas guias de remessa e guardar na base de dados
- **Processamento de Cargas:**
  - Cria ou busca clientes automaticamente via `ClienteService`
  - Busca encomendas por referência se fornecida
  - Processa múltiplas cargas/itens
- **Integração:**
  - Busca motoristas e viaturas da API
  - Cria guia via `GuiaRemessaService.criarGuiaRemessa()`
  - Gera referência automaticamente no backend
- **Botão:** "Gerar Guia" alterado para "Guardar Guia"

### 2.3 Preview e Geração de PDF
- **Componente:** `guias-cadastro.component.ts`
- **Funcionalidade:** Preview modal antes de gerar PDF (igual às cotações)
- **Fluxo:**
  1. Utilizador clica em "Gerar Guia" (botão secundário)
  2. Abre modal com preview formatado (sem campos de input)
  3. Utilizador clica em "Guardar PDF" para gerar e guardar o PDF
- **Tecnologia:** `html2pdf.js` para geração de PDF
- **Botão:** "Baixar PDF" alterado para "Gerar Guia"

---

## 3. Serviços Criados

### 3.1 MotoristaService
- **Ficheiro:** `lirandzo-app/src/app/services/motorista.service.ts`
- **Métodos:**
  - `listarMotoristas()`: Lista todos os motoristas
  - `obterMotorista(id)`: Obtém motorista por ID
- **Interface:** `Motorista` com campos `id`, `nome`, `telefone`, `numeroCarta`, `avaliacaoMedia`, `status`

### 3.2 ViaturaService
- **Ficheiro:** `lirandzo-app/src/app/services/viatura.service.ts`
- **Métodos:**
  - `listarViaturas()`: Lista todas as viaturas
  - `obterViatura(id)`: Obtém viatura por ID
- **Interface:** `Viatura` com campos `id`, `marca`, `modelo`, `matricula`, `tipo`, `capacidade`, `status`

---

## 4. Rotas Adicionadas

### 4.1 Viagens
- `/billing/viagens/:id` - Detalhe de viagem
- `/billing/viagens/:id/editar` - Editar viagem

**Ficheiro:** `lirandzo-app/src/app/app.routes.ts`

---

## 5. Correções de Erros

### 5.1 Erro no GuiaRemessaService
- **Problema:** `params` não estava tipado corretamente
- **Solução:** Importado `HttpParams` e usado `new HttpParams()` com `append()`
- **Ficheiro:** `lirandzo-app/src/app/services/guia-remessa.service.ts`

### 5.2 Erro no Template de Guias (find() no template)
- **Problema:** Angular não permite usar `find()` diretamente no template quando pode retornar `undefined`
- **Solução:** Criados métodos getter no componente TypeScript:
  - `getMotoristaNome()`: Retorna nome do motorista ou 'N/A'
  - `getViaturaDescricao()`: Retorna descrição formatada da viatura ou 'N/A'
- **Ficheiro:** `lirandzo-app/src/app/features/billing/guias/guias-cadastro.component.ts`

### 5.3 Erro no Template de Detalhe de Viagem
- **Problema:** Propriedade `encomendas` não existe em `ViagemResponse`
- **Solução:** Removida referência a `encomendas` e substituída por exibição de status
- **Ficheiro:** `lirandzo-app/src/app/features/billing/viagens/viagens-detalhe.component.html`

---

## 6. Estrutura de Ficheiros Criados/Modificados

### 6.1 Novos Componentes
- `lirandzo-app/src/app/features/billing/viagens/viagens-detalhe.component.ts`
- `lirandzo-app/src/app/features/billing/viagens/viagens-detalhe.component.html`
- `lirandzo-app/src/app/features/billing/viagens/viagens-detalhe.component.css`
- `lirandzo-app/src/app/features/billing/viagens/viagens-editar.component.ts`
- `lirandzo-app/src/app/features/billing/viagens/viagens-editar.component.html`

### 6.2 Novos Serviços
- `lirandzo-app/src/app/services/motorista.service.ts`
- `lirandzo-app/src/app/services/viatura.service.ts`

### 6.3 Componentes Modificados
- `lirandzo-app/src/app/features/billing/viagens/viagens-cadastro.component.ts`
- `lirandzo-app/src/app/features/billing/viagens/viagens-cadastro.component.html`
- `lirandzo-app/src/app/features/billing/guias/guias-lista.component.ts`
- `lirandzo-app/src/app/features/billing/guias/guias-lista.component.html`
- `lirandzo-app/src/app/features/billing/guias/guias-cadastro.component.ts`
- `lirandzo-app/src/app/features/billing/guias/guias-cadastro.component.html`
- `lirandzo-app/src/app/features/billing/guias/guias-cadastro.component.css`
- `lirandzo-app/src/app/services/guia-remessa.service.ts`
- `lirandzo-app/src/app/app.routes.ts`

---

## 7. Funcionalidades Técnicas

### 7.1 Integração com Backend
- Todos os componentes fazem chamadas HTTP para o backend Spring Boot
- Endpoints utilizados:
  - `GET /api/viagens` - Listar viagens
  - `GET /api/viagens/{id}` - Obter viagem
  - `POST /api/viagens` - Criar viagem
  - `PUT /api/viagens/{id}` - Atualizar viagem
  - `GET /api/guias-remessa` - Listar guias
  - `POST /api/guias-remessa` - Criar guia
  - `GET /api/motoristas` - Listar motoristas
  - `GET /api/viaturas` - Listar viaturas
  - `GET /api/clientes/search` - Buscar clientes
  - `POST /api/clientes` - Criar cliente

### 7.2 Preview Modal
- Implementado para Guias de Remessa (igual às Cotações)
- Modal com overlay escuro
- Conteúdo formatado sem campos de input
- Botão "Guardar PDF" para gerar e guardar PDF usando `html2pdf.js`

### 7.3 Notificações
- Componente `NotificationPopupComponent` usado em todos os formulários
- Mensagens de sucesso/erro com duração de 7 segundos
- Feedback visual para o utilizador

### 7.4 Estados de Loading e Error
- Todos os componentes de lista têm estados de loading
- Tratamento de erros com mensagens amigáveis
- Botões "Tentar Novamente" para retry

---

## 8. Padrões Seguidos

### 8.1 Estrutura de Componentes
- Standalone components (Angular 17+)
- Imports explícitos de módulos necessários
- Separação de responsabilidades (TypeScript, HTML, CSS)

### 8.2 Nomenclatura
- Componentes: `*-lista.component.ts`, `*-cadastro.component.ts`, `*-detalhe.component.ts`, `*-editar.component.ts`
- Serviços: `*-service.ts`
- Interfaces: `*Request`, `*Response`, `*Display`

### 8.3 Formatação de Dados
- Datas formatadas em português (pt-MZ)
- Valores monetários com 2 casas decimais e símbolo MZN
- Status mapeados de enum backend para display frontend

---

## 9. Melhorias Futuras Sugeridas

1. **Viagens:**
   - Adicionar campo para associar encomendas à viagem
   - Calcular KM percorridos automaticamente (kmChegada - kmSaida)
   - Adicionar histórico de alterações

2. **Guias:**
   - Permitir editar guias existentes
   - Adicionar componente de detalhe de guia
   - Melhorar busca de encomendas por referência

3. **Geral:**
   - Adicionar validações mais robustas nos formulários
   - Implementar paginação nas listas
   - Adicionar filtros avançados

---

## 10. Notas de Desenvolvimento

- Todos os componentes seguem o padrão estabelecido nas **Encomendas**
- Preview modal reutiliza estilos CSS das **Cotações**
- Integração com backend Spring Boot via REST APIs
- Uso de `@EntityGraph` no backend para evitar problemas de lazy loading
- Uso de `@JsonIgnoreProperties` para evitar recursão infinita na serialização JSON

---

**Fim do Documento**

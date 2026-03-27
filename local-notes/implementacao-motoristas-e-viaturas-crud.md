# Implementação de CRUD para Motoristas e Viaturas

Este documento detalha as alterações e novas implementações para adicionar funcionalidade CRUD (Criar, Ler, Atualizar, Apagar) para as entidades `Motorista` e `Viatura` na aplicação Angular, integrando-as com o backend Spring Boot.

## 1. Motoristas

### 1.1. Remover dados fictícios e buscar da base de dados (Ler)

- **Ficheiro:** `lirandzo-app/src/app/features/billing/motoristas/motoristas-lista.component.ts`
  - **Alterações:**
    - Removidos os dados fictícios (`motoristas` hardcoded).
    - Injeção de `MotoristaService`.
    - O método `carregarMotoristas()` agora busca os dados da API usando `motoristaService.listarMotoristas()`.
    - Implementado `mapearMotorista()` para transformar `Motorista` (da API) em `MotoristaDisplay` (para exibição).
    - Adicionados estados de `loading` e `error` para feedback ao utilizador.
    - Mapeamento de status do backend (`ATIVO`, `INATIVO`) para exibição (`DISPONÍVEL`, `INACTIVO`).
    - Os getters `totalMotoristas`, `disponiveis`, `emViagem`, `avaliacaoMedia` foram atualizados para usar os dados dinâmicos.

- **Ficheiro:** `lirandzo-app/src/app/features/billing/motoristas/motoristas-lista.component.html`
  - **Alterações:**
    - Adicionados blocos `@if (loading)` e `@else if (error)` para exibir estados de carregamento e erro.
    - Removidas colunas que não estão disponíveis na entidade do backend (`viaturaAtribuida`, `totalViagens`).
    - Mantidas as colunas: Nome, Telefone, Carta, Avaliação, Status, Acções.
    - Adicionados `routerLink` para as ações "Ver" e "Editar", apontando para `/billing/motoristas/:id` e `/billing/motoristas/:id/editar`.

### 1.2. Guardar Motorista (Criar)

- **Ficheiro:** `lirandzo-app/src/app/features/billing/motoristas/motoristas-cadastro.component.ts`
  - **Alterações:**
    - Injeção de `MotoristaService`, `Router` e `NotificationPopupComponent`.
    - O objeto `motorista` foi simplificado para incluir apenas os campos disponíveis na API:
      - `nome` (obrigatório)
      - `telefone` (opcional)
      - `numeroCarta` (opcional)
      - `status` (ATIVO ou INATIVO)
    - O método `salvar()` foi refatorado para:
      - Validar o campo obrigatório `nome`.
      - Criar o motorista no backend usando `motoristaService.criarMotorista()`.
      - Exibir notificações de sucesso ou erro.
      - Redirecionar para a página de detalhes do motorista após o sucesso.
    - Adicionado estado de `loading` para feedback durante o processo de guardar.

- **Ficheiro:** `lirandzo-app/src/app/features/billing/motoristas/motoristas-cadastro.component.html`
  - **Alterações:**
    - Simplificado o formulário para incluir apenas os campos disponíveis na API.
    - Removidos campos que não estão na entidade do backend (BI, data de nascimento, categoria carta, validade carta, endereço, contacto de emergência, observações).
    - Adicionado estado de `loading` ao botão de guardar.
    - Integrado o `app-notification-popup`.

### 1.3. Visualizar Motorista (Ler)

- **Ficheiro:** `lirandzo-app/src/app/features/billing/motoristas/motoristas-detalhe.component.ts` (NOVO)
  - **Funcionalidade:** Componente para exibir os detalhes de um único motorista.
  - **Implementação:**
    - Injeção de `ActivatedRoute`, `Router` e `MotoristaService`.
    - `ngOnInit` obtém o `id` da rota e chama `carregarMotorista()`.
    - `carregarMotorista()` busca o motorista usando `motoristaService.obterMotorista()`.
    - Métodos auxiliares para formatar status e obter classes CSS para badges.
    - Método `editar()` para navegar para a página de edição.

- **Ficheiro:** `lirandzo-app/src/app/features/billing/motoristas/motoristas-detalhe.component.html` (NOVO)
  - **Funcionalidade:** Template para exibir os detalhes do motorista.
  - **Implementação:**
    - Usa `app-billing-section-header` com `backLink` para `/billing/motoristas`.
    - Exibe estados de `loading` e `error`.
    - Apresenta informações do motorista: nome, telefone, status, número da carta, avaliação média.
    - Botão "Editar" com navegação para a rota de edição.

- **Ficheiro:** `lirandzo-app/src/app/features/billing/motoristas/motoristas-detalhe.component.css` (NOVO)
  - **Funcionalidade:** Estilos para o componente de detalhes do motorista, seguindo o padrão de outros componentes de detalhe.

### 1.4. Editar Motorista (Atualizar)

- **Ficheiro:** `lirandzo-app/src/app/features/billing/motoristas/motoristas-editar.component.ts` (NOVO)
  - **Funcionalidade:** Componente para editar um motorista existente.
  - **Implementação:**
    - Similar ao `motoristas-cadastro.component.ts`, mas carrega dados existentes no `ngOnInit` usando `motoristaService.obterMotorista()`.
    - O método `salvar()` agora chama `motoristaService.atualizarMotorista()` (PUT request).
    - `getBackLink()` para navegação dinâmica.
    - Tratamento de erros melhorado, incluindo verificação de conexão com o servidor.

- **Ficheiro:** `lirandzo-app/src/app/features/billing/motoristas/motoristas-editar.component.html` (NOVO)
  - **Funcionalidade:** Template para o formulário de edição de motorista.
  - **Implementação:**
    - Usa `app-billing-section-header` com título "Editar Motorista" e `backLink` dinâmico.
    - Campos do formulário pré-preenchidos com os dados do motorista.
    - Botão "Guardar Alterações" para submeter o formulário.
    - Integrado o `app-notification-popup`.

### 1.5. Serviço

- **Ficheiro:** `lirandzo-app/src/app/services/motorista.service.ts`
  - **Alterações:**
    - Adicionados métodos `criarMotorista()`, `atualizarMotorista()` e `excluirMotorista()` para completar o CRUD.

### 1.6. Rotas

- **Ficheiro:** `lirandzo-app/src/app/app.routes.ts`
  - **Alterações:**
    - Adicionadas as rotas:
      - `{ path: 'motoristas/:id', loadComponent: () => import('./features/billing/motoristas/motoristas-detalhe.component').then(m => m.MotoristasDetalheComponent) }`
      - `{ path: 'motoristas/:id/editar', loadComponent: () => import('./features/billing/motoristas/motoristas-editar.component').then(m => m.MotoristasEditarComponent) }`

## 2. Viaturas

### 2.1. Remover dados fictícios e buscar da base de dados (Ler)

- **Ficheiro:** `lirandzo-app/src/app/features/billing/viaturas/viaturas-lista.component.ts`
  - **Alterações:**
    - Removidos os dados fictícios (`viaturas` hardcoded).
    - Injeção de `ViaturaService`.
    - O método `carregarViaturas()` agora busca os dados da API usando `viaturaService.listarViaturas()`.
    - Implementado `mapearViatura()` para transformar `Viatura` (da API) em `ViaturaDisplay` (para exibição).
    - Adicionados estados de `loading` e `error` para feedback ao utilizador.
    - Mapeamento de status do backend (`ATIVA`, `EM_MANUTENCAO`, `RESERVADA`, `INATIVA`) para exibição (`OPERACIONAL`, `MANUTENÇÃO`, `RESERVADA`, `PARADO`).
    - Os getters `totalViaturas`, `operacionais`, `emManutencao` foram atualizados para usar os dados dinâmicos.
    - O getter `consumoMedioGeral` retorna 'N/A' porque o consumo médio não está disponível na entidade do backend.

- **Ficheiro:** `lirandzo-app/src/app/features/billing/viaturas/viaturas-lista.component.html`
  - **Alterações:**
    - Adicionados blocos `@if (loading)` e `@else if (error)` para exibir estados de carregamento e erro.
    - Removidas colunas que não estão disponíveis na entidade do backend (`ano`, `kmActual`, `ultimaManutencao`, `consumoMedio`).
    - Mantidas as colunas: Matrícula, Marca/Modelo, Tipo, Capacidade (ton), Status, Acções.
    - Adicionados `routerLink` para as ações "Ver" e "Editar", apontando para `/billing/viaturas/:id` e `/billing/viaturas/:id/editar`.

### 2.2. Guardar Viatura (Criar)

- **Ficheiro:** `lirandzo-app/src/app/features/billing/viaturas/viaturas-cadastro.component.ts`
  - **Alterações:**
    - Injeção de `ViaturaService`, `Router` e `NotificationPopupComponent`.
    - O objeto `viatura` foi simplificado para incluir apenas os campos disponíveis na API:
      - `matricula` (obrigatório)
      - `marca` (obrigatório)
      - `modelo` (obrigatório)
      - `tipo` (opcional)
      - `capacidade` (opcional)
      - `status` (ATIVA, EM_MANUTENCAO, RESERVADA, INATIVA)
    - Removidos campos que não estão na entidade do backend (ano, cor, chassi, kmActual, consumoMedio, observacoes, foto).
    - O método `salvar()` foi refatorado para:
      - Validar os campos obrigatórios (`matricula`, `marca`, `modelo`).
      - Criar a viatura no backend usando `viaturaService.criarViatura()`.
      - Exibir notificações de sucesso ou erro.
      - Redirecionar para a página de detalhes da viatura após o sucesso.
    - Adicionado estado de `loading` para feedback durante o processo de guardar.

- **Ficheiro:** `lirandzo-app/src/app/features/billing/viaturas/viaturas-cadastro.component.html`
  - **Alterações:**
    - Simplificado o formulário para incluir apenas os campos disponíveis na API.
    - Removidos campos que não estão na entidade do backend (ano, cor, chassi, kmActual, consumoMedio, observacoes, foto).
    - Adicionado estado de `loading` ao botão de guardar.
    - Integrado o `app-notification-popup`.

### 2.3. Visualizar Viatura (Ler)

- **Ficheiro:** `lirandzo-app/src/app/features/billing/viaturas/viaturas-detalhe.component.ts` (NOVO)
  - **Funcionalidade:** Componente para exibir os detalhes de uma única viatura.
  - **Implementação:**
    - Injeção de `ActivatedRoute`, `Router` e `ViaturaService`.
    - `ngOnInit` obtém o `id` da rota e chama `carregarViatura()`.
    - `carregarViatura()` busca a viatura usando `viaturaService.obterViatura()`.
    - Métodos auxiliares para formatar status e obter classes CSS para badges.
    - Método `editar()` para navegar para a página de edição.

- **Ficheiro:** `lirandzo-app/src/app/features/billing/viaturas/viaturas-detalhe.component.html` (NOVO)
  - **Funcionalidade:** Template para exibir os detalhes da viatura.
  - **Implementação:**
    - Usa `app-billing-section-header` com `backLink` para `/billing/viaturas`.
    - Exibe estados de `loading` e `error`.
    - Apresenta informações da viatura: matrícula, marca, modelo, tipo, capacidade, status.
    - Botão "Editar" com navegação para a rota de edição.

- **Ficheiro:** `lirandzo-app/src/app/features/billing/viaturas/viaturas-detalhe.component.css` (NOVO)
  - **Funcionalidade:** Estilos para o componente de detalhes da viatura, seguindo o padrão de outros componentes de detalhe.

### 2.4. Editar Viatura (Atualizar)

- **Ficheiro:** `lirandzo-app/src/app/features/billing/viaturas/viaturas-editar.component.ts` (NOVO)
  - **Funcionalidade:** Componente para editar uma viatura existente.
  - **Implementação:**
    - Similar ao `viaturas-cadastro.component.ts`, mas carrega dados existentes no `ngOnInit` usando `viaturaService.obterViatura()`.
    - O método `salvar()` agora chama `viaturaService.atualizarViatura()` (PUT request).
    - `getBackLink()` para navegação dinâmica.
    - Tratamento de erros melhorado, incluindo verificação de conexão com o servidor.

- **Ficheiro:** `lirandzo-app/src/app/features/billing/viaturas/viaturas-editar.component.html` (NOVO)
  - **Funcionalidade:** Template para o formulário de edição de viatura.
  - **Implementação:**
    - Usa `app-billing-section-header` com título "Editar Viatura" e `backLink` dinâmico.
    - Campos do formulário pré-preenchidos com os dados da viatura.
    - Botão "Guardar Alterações" para submeter o formulário.
    - Integrado o `app-notification-popup`.

### 2.5. Serviço

- **Ficheiro:** `lirandzo-app/src/app/services/viatura.service.ts`
  - **Alterações:**
    - Adicionados métodos `criarViatura()`, `atualizarViatura()` e `excluirViatura()` para completar o CRUD.

### 2.6. Rotas

- **Ficheiro:** `lirandzo-app/src/app/app.routes.ts`
  - **Alterações:**
    - Adicionadas as rotas:
      - `{ path: 'viaturas/:id', loadComponent: () => import('./features/billing/viaturas/viaturas-detalhe.component').then(m => m.ViaturasDetalheComponent) }`
      - `{ path: 'viaturas/:id/editar', loadComponent: () => import('./features/billing/viaturas/viaturas-editar.component').then(m => m.ViaturasEditarComponent) }`

## 3. Resumo das Alterações

### 3.1. Componentes Criados

- `motoristas-detalhe.component.ts`, `.html`, `.css`
- `motoristas-editar.component.ts`, `.html`
- `viaturas-detalhe.component.ts`, `.html`, `.css`
- `viaturas-editar.component.ts`, `.html`

### 3.2. Componentes Atualizados

- `motoristas-lista.component.ts`, `.html`
- `motoristas-cadastro.component.ts`, `.html`
- `viaturas-lista.component.ts`, `.html`
- `viaturas-cadastro.component.ts`, `.html`

### 3.3. Serviços Atualizados

- `motorista.service.ts` - Adicionados métodos `criarMotorista()`, `atualizarMotorista()`, `excluirMotorista()`
- `viatura.service.ts` - Adicionados métodos `criarViatura()`, `atualizarViatura()`, `excluirViatura()`

### 3.4. Rotas Adicionadas

- `/billing/motoristas/:id` - Visualizar detalhes do motorista
- `/billing/motoristas/:id/editar` - Editar motorista
- `/billing/viaturas/:id` - Visualizar detalhes da viatura
- `/billing/viaturas/:id/editar` - Editar viatura

## 4. Funcionalidades Implementadas

### 4.1. Motoristas

- ✅ Listar motoristas da base de dados
- ✅ Criar novo motorista
- ✅ Visualizar detalhes do motorista
- ✅ Editar motorista existente
- ✅ Guardar alterações na base de dados
- ✅ Notificações de sucesso/erro
- ✅ Estados de loading e erro

### 4.2. Viaturas

- ✅ Listar viaturas da base de dados
- ✅ Criar nova viatura
- ✅ Visualizar detalhes da viatura
- ✅ Editar viatura existente
- ✅ Guardar alterações na base de dados
- ✅ Notificações de sucesso/erro
- ✅ Estados de loading e erro

## 5. Notas Importantes

1. **Campos Removidos:** Alguns campos que existiam nos dados fictícios foram removidos porque não estão disponíveis na entidade do backend:
   - Motoristas: BI, data de nascimento, categoria carta, validade carta, endereço, contacto de emergência, observações, viatura atribuída, total de viagens
   - Viaturas: ano, cor, chassi, km actual, última manutenção, próxima manutenção, consumo médio, observações, foto

2. **Mapeamento de Status:** Os status do backend são mapeados para exibição mais amigável:
   - Motoristas: `ATIVO` → `DISPONÍVEL`, `INATIVO` → `INACTIVO`
   - Viaturas: `ATIVA` → `OPERACIONAL`, `EM_MANUTENCAO` → `MANUTENÇÃO`, `INATIVA` → `PARADO`

3. **Validação:** Os formulários validam campos obrigatórios antes de submeter:
   - Motoristas: `nome` é obrigatório
   - Viaturas: `matricula`, `marca`, `modelo` são obrigatórios

4. **Navegação:** Após criar ou editar com sucesso, o utilizador é redirecionado para a página de detalhes do item criado/editado.

5. **Tratamento de Erros:** Todos os componentes incluem tratamento de erros adequado, incluindo verificação de conexão com o servidor e mensagens de erro amigáveis.

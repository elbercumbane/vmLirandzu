# Popup de Notificação - Guardar Factura

**Data:** 2025-01-08  
**Tipo:** Funcionalidade Frontend  
**Status:** ✅ Implementado

## O que foi feito

Implementado popup de notificação simples e bonito que aparece quando uma factura é guardada no dashboard de encomendas.

### Funcionalidades:

1. ✅ Popup aparece automaticamente após guardar factura
2. ✅ Mostra "Factura guardada" em caso de sucesso
3. ✅ Mostra "Factura não guardada" em caso de erro
4. ✅ Popup desaparece automaticamente após 7 segundos
5. ✅ Design moderno e bonito com animações suaves
6. ✅ Responsivo para mobile

## Componentes Criados

### 1. NotificationPopupComponent
**Localização:** `lirandzo-app/src/app/shared/components/notification-popup/`

**Características:**
- Componente standalone reutilizável
- Suporta dois tipos: `success` e `error`
- Animação de entrada suave (slide in da direita)
- Botão de fechar manual
- Auto-dismiss após duração configurável (padrão: 7 segundos)

**Props:**
- `message` - Mensagem a exibir
- `type` - Tipo: 'success' ou 'error'
- `duration` - Duração em milissegundos (padrão: 7000)

### 2. EncomendaService
**Localização:** `lirandzo-app/src/app/services/encomenda.service.ts`

**Métodos:**
- `criarEncomenda()` - Cria nova encomenda na API
- `listarEncomendas()` - Lista todas as encomendas
- `obterEncomenda()` - Obtém encomenda por ID

## Modificações no Componente de Cadastro

### EncomendasCadastroComponent
**Localização:** `lirandzo-app/src/app/features/billing/encomendas/encomendas-cadastro.component.ts`

**Funcionalidades Adicionadas:**

1. **Integração com API:**
   - Busca ou cria cliente automaticamente
   - Cria encomenda na base de dados
   - Valida campos obrigatórios

2. **Popup de Notificação:**
   - Mostra sucesso quando factura é guardada
   - Mostra erro quando há problemas
   - Limpa formulário após sucesso

3. **Lógica de Cliente:**
   - Tenta buscar cliente existente por nome ou telefone
   - Cria novo cliente se não encontrar
   - Usa cliente existente se encontrar

## Estilo do Popup

### Cores:
- **Sucesso:** Verde (#10b981) com fundo claro
- **Erro:** Vermelho (#ef4444) com fundo claro

### Posicionamento:
- Canto superior direito
- Fixed position com z-index alto
- Responsivo (ajusta em mobile)

### Animações:
- Entrada: slide in da direita com fade
- Saída: fade out suave
- Duração: 300ms

## Como Funciona

1. Utilizador preenche formulário de factura
2. Clica em "Guardar Factura"
3. Sistema valida campos obrigatórios
4. Busca ou cria cliente na base de dados
5. Cria encomenda na base de dados
6. Mostra popup:
   - ✅ "Factura guardada" se sucesso
   - ❌ "Factura não guardada" se erro
7. Popup desaparece após 7 segundos
8. Formulário é limpo após sucesso

## Exemplo de Uso

```typescript
// No componente
this.mostrarNotificacao('Factura guardada', 'success');
// ou
this.mostrarNotificacao('Factura não guardada', 'error');
```

```html
<!-- No template -->
<app-notification-popup 
  *ngIf="showNotification"
  [message]="notificationMessage"
  [type]="notificationType"
  [duration]="7000">
</app-notification-popup>
```

## Configuração

### Environment
**Ficheiro:** `lirandzo-app/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

### App Config
**Ficheiro:** `lirandzo-app/src/app/app.config.ts`

HttpClient foi adicionado aos providers para permitir chamadas HTTP.

## Validações

O sistema valida:
- Nome do cliente (obrigatório)
- Endereço do cliente (obrigatório)
- Total geral > 0 (deve ter itens ou custos)

## Próximos Passos (Opcional)

- [ ] Adicionar som de notificação
- [ ] Suporte para múltiplas notificações simultâneas
- [ ] Histórico de notificações
- [ ] Personalização de cores por tipo

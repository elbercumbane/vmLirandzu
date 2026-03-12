# Correção Erro Conexão Backend

**Data:** 2025-01-08  
**Tipo:** Correção  
**Status:** ✅ Corrigido

## Problema

Erro `ERR_CONNECTION_REFUSED` ao tentar guardar factura:
- Backend não está acessível na porta 8080
- URLs hardcoded no código em vez de usar environment
- Falta serviço de cliente

## Solução Aplicada

### 1. Criado ClienteService
**Localização:** `lirandzo-app/src/app/services/cliente.service.ts`

- Usa environment para URL da API
- Métodos: `buscarClientes()` e `criarCliente()`

### 2. Corrigido EncomendasCadastroComponent
- Removido uso direto de `HttpClient`
- Usa `ClienteService` e `EncomendaService`
- Todas as URLs agora vêm do environment

### 3. Melhor Tratamento de Erros
- Validação de IDs antes de usar
- Mensagens de erro mais claras
- Logs para debugging

## Como Verificar se Backend Está Rodando

### Verificar Processo Java:
```powershell
Get-Process -Name java
```

### Verificar Porta 8080:
```powershell
netstat -ano | findstr :8080
```

### Testar API:
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method GET
```

## Se Backend Não Estiver Rodando

### Iniciar Backend:
```powershell
cd lirandzo-backend
mvn spring-boot:run
```

### Ou usar Docker:
```powershell
docker-compose up backend -d
```

## Configuração Environment

**Ficheiro:** `lirandzo-app/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

**Nota:** Se o backend estiver em outra porta ou URL, ajuste aqui.

## Próximos Passos

1. ✅ Código corrigido para usar services
2. ⏭️ Verificar se backend está rodando
3. ⏭️ Testar guardar factura novamente

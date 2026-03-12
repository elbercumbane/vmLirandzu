# Comandos PostgreSQL - CMD vs PowerShell

**Data:** 2025-01-08  
**Tipo:** Guia de Comandos

## Diferença entre CMD e PowerShell

### No CMD (Command Prompt):
- Não usa `&` antes de comandos
- Usa aspas simples ou duplas de forma diferente

### No PowerShell:
- Pode usar `&` para executar comandos com espaços no caminho
- Usa aspas de forma mais flexível

## Comandos Corretos

### Opção 1: No CMD (Command Prompt)

```cmd
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432
```

### Opção 2: No PowerShell

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432
```

### Opção 3: Adicionar ao PATH (funciona em ambos)

Se adicionar PostgreSQL ao PATH do sistema, pode usar simplesmente:

```cmd
psql -U postgres -h localhost -p 5432
```

## Como Saber Qual Está a Usar

- **CMD:** Prompt mostra `C:\Users\...>` 
- **PowerShell:** Prompt mostra `PS C:\Users\...>`

## Solução Rápida

Se estiver no CMD, use:

```cmd
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432
```

(Sem o `&` no início)

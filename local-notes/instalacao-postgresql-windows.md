# Instalação do PostgreSQL no Windows

**Data:** 2025-03-08  
**Tipo:** Configuração

## Status

O PostgreSQL precisa ser instalado localmente no Windows. O instalador foi baixado para `%TEMP%\postgresql-installer.exe`.

## Opções de Instalação

### Opção 1: Instalação Manual (Recomendada)

1. Abrir PowerShell como **Administrador**
2. Executar o instalador baixado:
   ```powershell
   Start-Process "$env:TEMP\postgresql-installer.exe" -Verb RunAs
   ```
3. Durante a instalação, configurar:
   - **Porta:** 5433 (para não conflitar com Docker se necessário)
   - **Password:** admin123 (ou a senha desejada)
   - **Superuser:** postgres
   - **Locale:** Portuguese (ou padrão)

### Opção 2: Chocolatey (Requer Admin)

```powershell
# Executar PowerShell como Administrador
choco install postgresql16 --params '/Password:admin123 /Port:5433' -y
```

### Opção 3: Usar Docker (Já Configurado)

O PostgreSQL já está configurado e rodando via Docker na porta 5433:
- Container: `lirandzo-postgres`
- Porta: 5433
- Usuário: postgres
- Senha: admin123
- Base de dados: lirandzo_db

## Verificação Pós-Instalação

Após instalar, verificar:

```powershell
# Verificar serviço
Get-Service -Name "*postgresql*"

# Verificar se psql está disponível
psql --version

# Testar conexão
psql -U postgres -h localhost -p 5433 -c "SELECT version();"
```

## Configuração da Base de Dados

Após instalação, criar a base de dados:

```sql
-- Conectar ao PostgreSQL
psql -U postgres -h localhost -p 5433

-- Criar base de dados
CREATE DATABASE lirandzo_db;

-- Verificar
\l
```

## Configuração do Backend

O backend está configurado para conectar em:
- **URL:** `jdbc:postgresql://localhost:5433/lirandzo_db`
- **Usuário:** postgres
- **Senha:** admin123

Arquivo de configuração: `lirandzo-backend/src/main/resources/application.properties`

## Notas

- Se usar Docker, não é necessário instalar PostgreSQL localmente
- A porta 5433 foi escolhida para evitar conflitos com outras instalações
- A senha `admin123` deve ser alterada em produção

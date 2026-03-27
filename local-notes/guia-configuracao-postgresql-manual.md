# Guia Manual - Configurar PostgreSQL Password "admin"

**Data:** 2025-01-08  
**Tipo:** Guia Manual  
**Prioridade:** Alta

## Primeiro Passo: Conectar ao PostgreSQL

Como ainda não abriu o PostgreSQL pela primeira vez, vamos começar por conectar.

### Opção 1: Via linha de comandos (psql)

1. **Abrir PowerShell** (não precisa ser Administrador)

2. **Conectar ao PostgreSQL:**
   ```powershell
   & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432
   ```

3. **Se pedir password:**
   - Tente a password que definiu durante a instalação do PostgreSQL
   - Se não se lembrar, tente: `postgres` ou `admin123` ou deixe vazio (Enter)
   - Se nenhuma funcionar, veja Opção 2 abaixo

### Opção 2: Se não conseguir conectar (password desconhecida)

Se não conseguir conectar porque não sabe a password, pode usar autenticação do Windows:

```powershell
# Tentar conectar com o seu utilizador do Windows
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U $env:USERNAME -h localhost -p 5432 -d postgres
```

Ou modificar temporariamente o pg_hba.conf (requer Admin - veja abaixo).

## Segundo Passo: Alterar Password para "admin"

Depois de conseguir conectar (seja qual método funcionar), execute no prompt do psql:

```sql
ALTER USER postgres WITH PASSWORD 'admin';
```

Depois saia:
```sql
\q
```

## Terceiro Passo: Verificar Nova Password

Teste se a nova password funciona:

```powershell
$env:PGPASSWORD = "admin"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -c "SELECT version();"
```

Se mostrar a versão do PostgreSQL, está funcionando!

## Quarto Passo: Criar Base de Dados

```powershell
$env:PGPASSWORD = "admin"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -f "lirandzo-backend\scripts\create-database-only.sql"
```

## Quinto Passo: Criar Tabelas

```powershell
$env:PGPASSWORD = "admin"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -d lirandzo_db -f "lirandzo-backend\scripts\create-tables-only.sql"
```

## Se Nada Funcionar: Modificar pg_hba.conf (Requer Admin)

Se não conseguir conectar de forma alguma:

1. **Parar serviço PostgreSQL:**
   ```powershell
   Stop-Service postgresql-x64-16
   ```

2. **Fazer backup do pg_hba.conf:**
   ```powershell
   Copy-Item "C:\Program Files\PostgreSQL\16\data\pg_hba.conf" "C:\Program Files\PostgreSQL\16\data\pg_hba.conf.backup"
   ```

3. **Editar pg_hba.conf** (abrir com Notepad como Administrador):
   ```powershell
   notepad "C:\Program Files\PostgreSQL\16\data\pg_hba.conf"
   ```

4. **Modificar estas linhas:**
   
   **De:**
   ```
   local   all             all                                     scram-sha-256
   host    all             all             127.0.0.1/32            scram-sha-256
   ```
   
   **Para:**
   ```
   local   all             all                                     trust
   host    all             all             127.0.0.1/32            trust
   ```

5. **Salvar e iniciar serviço:**
   ```powershell
   Start-Service postgresql-x64-16
   ```

6. **Agora pode conectar sem password:**
   ```powershell
   & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432
   ```

7. **Alterar password:**
   ```sql
   ALTER USER postgres WITH PASSWORD 'admin';
   \q
   ```

8. **Reverter pg_hba.conf para segurança:**
   - Voltar a editar e mudar `trust` de volta para `scram-sha-256`
   - Reiniciar serviço

## Resumo dos Comandos (Sequência Completa)

```powershell
# 1. Conectar (tente primeiro sem password, depois com a que definiu na instalação)
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432

# No prompt do psql:
ALTER USER postgres WITH PASSWORD 'admin';
\q

# 2. Criar base de dados
$env:PGPASSWORD = "admin"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -f "lirandzo-backend\scripts\create-database-only.sql"

# 3. Criar tabelas
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -d lirandzo_db -f "lirandzo-backend\scripts\create-tables-only.sql"

# 4. Verificar
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -d lirandzo_db -c "\dt"
```

## Verificação Final

Para verificar se tudo está correto:

```powershell
$env:PGPASSWORD = "admin"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -d lirandzo_db -c "\dt"
```

Deve mostrar todas as tabelas:
- roles
- usuarios
- usuarios_roles
- clientes
- viaturas
- motoristas
- viagens
- encomendas
- pagamentos

## Notas Importantes

- A password "admin" é para desenvolvimento. Em produção use senhas fortes.
- Se usar Docker, a password já está configurada no docker-compose.yml.
- Todos os ficheiros de configuração do backend já estão atualizados para usar password "admin".

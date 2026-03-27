# ============================================================================
# Script para configurar password PostgreSQL e criar base de dados
# ============================================================================

Write-Host "=== Configuração PostgreSQL vmLirandzu ===" -ForegroundColor Green
Write-Host ""

$PSQL_PATH = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$POSTGRES_USER = "postgres"
$POSTGRES_PASSWORD = "admin"
$DATABASE_NAME = "lirandzo_db"
$PORT = "5432"

# Verificar se psql existe
if (-not (Test-Path $PSQL_PATH)) {
    Write-Host "Erro: psql.exe não encontrado em $PSQL_PATH" -ForegroundColor Red
    Write-Host "Por favor, ajuste o caminho no script ou adicione PostgreSQL ao PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "PostgreSQL encontrado: $PSQL_PATH" -ForegroundColor Green
Write-Host ""

# Criar script SQL temporário para alterar password
$alterPasswordSql = @"
ALTER USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';
"@

$tempPasswordFile = [System.IO.Path]::GetTempFileName()
$alterPasswordSql | Out-File -FilePath $tempPasswordFile -Encoding UTF8

Write-Host "Para configurar a password, execute manualmente:" -ForegroundColor Yellow
Write-Host "  $PSQL_PATH -U $POSTGRES_USER -h localhost -p $PORT -f `"$tempPasswordFile`"" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ou execute diretamente:" -ForegroundColor Yellow
Write-Host "  $PSQL_PATH -U $POSTGRES_USER -h localhost -p $PORT" -ForegroundColor Cyan
Write-Host "  ALTER USER postgres WITH PASSWORD 'admin';" -ForegroundColor Cyan
Write-Host ""

# Criar script SQL para criar base de dados
$createDbSql = @"
CREATE DATABASE $DATABASE_NAME
    WITH 
    OWNER = $POSTGRES_USER
    ENCODING = 'UTF8'
    LC_COLLATE = 'Portuguese_Portugal.1252'
    LC_CTYPE = 'Portuguese_Portugal.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
"@

$tempDbFile = [System.IO.Path]::GetTempFileName()
$createDbSql | Out-File -FilePath $tempDbFile -Encoding UTF8

Write-Host "Para criar a base de dados, execute:" -ForegroundColor Yellow
Write-Host "  `$env:PGPASSWORD='admin'" -ForegroundColor Cyan
Write-Host "  $PSQL_PATH -U $POSTGRES_USER -h localhost -p $PORT -f `"$tempDbFile`"" -ForegroundColor Cyan
Write-Host ""

# Executar criação da base de dados (se password já estiver configurada)
Write-Host "Tentando criar base de dados..." -ForegroundColor Yellow
$env:PGPASSWORD = $POSTGRES_PASSWORD
& $PSQL_PATH -U $POSTGRES_USER -h localhost -p $PORT -f $tempDbFile 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "Base de dados criada com sucesso!" -ForegroundColor Green
} elseif ($LASTEXITCODE -eq 1) {
    Write-Host "Aviso: Base de dados pode já existir (código de saída: $LASTEXITCODE)" -ForegroundColor Yellow
} else {
    Write-Host "Erro ao criar base de dados. Verifique a password." -ForegroundColor Red
    Write-Host "Execute manualmente:" -ForegroundColor Yellow
    Write-Host "  `$env:PGPASSWORD='admin'" -ForegroundColor Cyan
    Write-Host "  $PSQL_PATH -U $POSTGRES_USER -h localhost -p $PORT -f `"$tempDbFile`"" -ForegroundColor Cyan
}

# Executar script de criação de tabelas
$tablesScript = Join-Path $PSScriptRoot "..\lirandzo-backend\scripts\create-tables-only.sql"

if (Test-Path $tablesScript) {
    Write-Host ""
    Write-Host "Criando tabelas..." -ForegroundColor Yellow
    & $PSQL_PATH -U $POSTGRES_USER -h localhost -p $PORT -d $DATABASE_NAME -f $tablesScript 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Tabelas criadas com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "Aviso: Pode ter havido erros ao criar tabelas (podem já existir)" -ForegroundColor Yellow
        Write-Host "Execute manualmente para ver detalhes:" -ForegroundColor Yellow
        Write-Host "  `$env:PGPASSWORD='admin'" -ForegroundColor Cyan
        Write-Host "  $PSQL_PATH -U $POSTGRES_USER -h localhost -p $PORT -d $DATABASE_NAME -f `"$tablesScript`"" -ForegroundColor Cyan
    }
} else {
    Write-Host ""
    Write-Host "Erro: Script de tabelas não encontrado em $tablesScript" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Resumo ===" -ForegroundColor Green
Write-Host "Usuário: $POSTGRES_USER" -ForegroundColor Cyan
Write-Host "Password: $POSTGRES_PASSWORD" -ForegroundColor Cyan
Write-Host "Base de dados: $DATABASE_NAME" -ForegroundColor Cyan
Write-Host "Porta: $PORT" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para testar conexão:" -ForegroundColor Yellow
Write-Host "  `$env:PGPASSWORD='admin'" -ForegroundColor Cyan
Write-Host "  $PSQL_PATH -U $POSTGRES_USER -h localhost -p $PORT -d $DATABASE_NAME" -ForegroundColor Cyan

# Limpar ficheiros temporários
Remove-Item $tempPasswordFile -ErrorAction SilentlyContinue
Remove-Item $tempDbFile -ErrorAction SilentlyContinue

# Script inteligente para configurar password PostgreSQL
# Tenta várias passwords comuns antes de modificar pg_hba.conf

$PSQL_PATH = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$POSTGRES_USER = "postgres"
$NEW_PASSWORD = "admin"
$PORT = "5432"

Write-Host "=== Configuração Inteligente Password PostgreSQL ===" -ForegroundColor Green
Write-Host ""

# Lista de passwords comuns para tentar
$commonPasswords = @("postgres", "admin", "admin123", "root", "password", "123456", "")

Write-Host "Tentando descobrir password atual..." -ForegroundColor Yellow

$currentPassword = $null
foreach ($pwd in $commonPasswords) {
    Write-Host "  Tentando: $($pwd -replace '.', '*')" -ForegroundColor Gray
    $env:PGPASSWORD = $pwd
    & $PSQL_PATH -U $POSTGRES_USER -h localhost -p $PORT -c "SELECT 1;" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $currentPassword = $pwd
        Write-Host "  Password encontrada!" -ForegroundColor Green
        break
    }
}

if ($null -ne $currentPassword) {
    Write-Host ""
    Write-Host "Password atual descoberta. Alterando para '$NEW_PASSWORD'..." -ForegroundColor Yellow
    $env:PGPASSWORD = $currentPassword
    & $PSQL_PATH -U $POSTGRES_USER -h localhost -p $PORT -c "ALTER USER $POSTGRES_USER WITH PASSWORD '$NEW_PASSWORD';" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Password alterada com sucesso!" -ForegroundColor Green
        
        # Testar nova password
        Write-Host ""
        Write-Host "Testando nova password..." -ForegroundColor Yellow
        $env:PGPASSWORD = $NEW_PASSWORD
        & $PSQL_PATH -U $POSTGRES_USER -h localhost -p $PORT -c "SELECT 1;" 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Conexão bem-sucedida com nova password!" -ForegroundColor Green
            
            # Criar base de dados e tabelas
            Write-Host ""
            Write-Host "Criando base de dados e tabelas..." -ForegroundColor Yellow
            
            $createDbScript = Join-Path $PSScriptRoot "..\lirandzo-backend\scripts\create-database-only.sql"
            $createTablesScript = Join-Path $PSScriptRoot "..\lirandzo-backend\scripts\create-tables-only.sql"
            
            if (Test-Path $createDbScript) {
                & $PSQL_PATH -U $POSTGRES_USER -h localhost -p $PORT -f $createDbScript 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
                    Write-Host "  Base de dados criada!" -ForegroundColor Green
                }
            }
            
            if (Test-Path $createTablesScript) {
                & $PSQL_PATH -U $POSTGRES_USER -h localhost -p $PORT -d lirandzo_db -f $createTablesScript 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  Tabelas criadas!" -ForegroundColor Green
                }
            }
            
            Write-Host ""
            Write-Host "=== Configuração concluída! ===" -ForegroundColor Green
            Write-Host "Password: $NEW_PASSWORD" -ForegroundColor Cyan
            Write-Host "Base de dados: lirandzo_db" -ForegroundColor Cyan
            exit 0
        }
    }
} else {
    Write-Host ""
    Write-Host "Não foi possível descobrir password automaticamente." -ForegroundColor Yellow
    Write-Host "Tentando método alternativo (requer Admin)..." -ForegroundColor Yellow
    Write-Host ""
    
    # Tentar método de modificar pg_hba.conf
    $scriptPath = Join-Path $PSScriptRoot "configurar-password-auto.ps1"
    if (Test-Path $scriptPath) {
        Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Wait
    } else {
        Write-Host "Erro: Script alternativo não encontrado." -ForegroundColor Red
        Write-Host ""
        Write-Host "Por favor, configure manualmente:" -ForegroundColor Yellow
        Write-Host "  & `"$PSQL_PATH`" -U $POSTGRES_USER -h localhost -p $PORT" -ForegroundColor Cyan
        Write-Host "  ALTER USER postgres WITH PASSWORD 'admin';" -ForegroundColor Cyan
        exit 1
    }
}

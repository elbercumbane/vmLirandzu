# Script para configurar password PostgreSQL automaticamente
# Tenta modificar pg_hba.conf temporariamente

$PSQL_PATH = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$PGDATA = "C:\Program Files\PostgreSQL\16\data"
$PGHBA = "$PGDATA\pg_hba.conf"
$SERVICE_NAME = "postgresql-x64-16"
$POSTGRES_USER = "postgres"
$NEW_PASSWORD = "admin"

Write-Host "=== Configuração Automática Password PostgreSQL ===" -ForegroundColor Green
Write-Host ""

# Verificar se está executando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "AVISO: Este script requer permissões de Administrador!" -ForegroundColor Yellow
    Write-Host "Tentando executar como Administrador..." -ForegroundColor Yellow
    Write-Host ""
    
    $scriptPath = Join-Path $PSScriptRoot "configurar-password-auto.ps1"
    Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Wait
    exit $LASTEXITCODE
}

# Verificar se ficheiros existem
if (-not (Test-Path $PGHBA)) {
    Write-Host "Erro: pg_hba.conf não encontrado em $PGHBA" -ForegroundColor Red
    exit 1
}

Write-Host "1. Fazendo backup do pg_hba.conf..." -ForegroundColor Yellow
$PGHBA_BACKUP = "$PGHBA.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $PGHBA $PGHBA_BACKUP -Force

Write-Host "2. Modificando pg_hba.conf para trust temporariamente..." -ForegroundColor Yellow
$content = Get-Content $PGHBA
$newContent = $content | ForEach-Object {
    if ($_ -match "^local\s+all\s+all\s+scram-sha-256") {
        "local   all             all                                     trust"
    } elseif ($_ -match "^host\s+all\s+all\s+127\.0\.0\.1/32\s+scram-sha-256") {
        "host    all             all             127.0.0.1/32            trust"
    } elseif ($_ -match "^host\s+all\s+all\s+::1/128\s+scram-sha-256") {
        "host    all             all             ::1/128                 trust"
    } else {
        $_
    }
}
$newContent | Set-Content $PGHBA -Encoding UTF8

Write-Host "3. Recarregando configuração do PostgreSQL..." -ForegroundColor Yellow
Restart-Service $SERVICE_NAME -Force
Start-Sleep -Seconds 5

Write-Host "4. Alterando password para '$NEW_PASSWORD'..." -ForegroundColor Yellow
$env:PGPASSWORD = $null
& $PSQL_PATH -U $POSTGRES_USER -h localhost -p 5432 -c "ALTER USER $POSTGRES_USER WITH PASSWORD '$NEW_PASSWORD';" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Password alterada com sucesso!" -ForegroundColor Green
} else {
    Write-Host "   Erro ao alterar password. Código: $LASTEXITCODE" -ForegroundColor Red
}

Write-Host "5. Restaurando pg_hba.conf original..." -ForegroundColor Yellow
Copy-Item $PGHBA_BACKUP $PGHBA -Force
Restart-Service $SERVICE_NAME -Force
Start-Sleep -Seconds 3

Write-Host "6. Testando conexão com nova password..." -ForegroundColor Yellow
$env:PGPASSWORD = $NEW_PASSWORD
& $PSQL_PATH -U $POSTGRES_USER -h localhost -p 5432 -c "SELECT 1;" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Conexão bem-sucedida!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== Configuração concluída! ===" -ForegroundColor Green
    Write-Host "Password configurada: $NEW_PASSWORD" -ForegroundColor Cyan
    
    # Agora criar base de dados e tabelas
    Write-Host ""
    Write-Host "7. Criando base de dados e tabelas..." -ForegroundColor Yellow
    $createDbScript = Join-Path $PSScriptRoot "..\lirandzo-backend\scripts\create-database-only.sql"
    $createTablesScript = Join-Path $PSScriptRoot "..\lirandzo-backend\scripts\create-tables-only.sql"
    
    if (Test-Path $createDbScript) {
        & $PSQL_PATH -U $POSTGRES_USER -h localhost -p 5432 -f $createDbScript 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
            Write-Host "   Base de dados criada!" -ForegroundColor Green
        }
    }
    
    if (Test-Path $createTablesScript) {
        & $PSQL_PATH -U $POSTGRES_USER -h localhost -p 5432 -d lirandzo_db -f $createTablesScript 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   Tabelas criadas!" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "=== Tudo configurado! ===" -ForegroundColor Green
} else {
    Write-Host "   Erro ao testar conexão." -ForegroundColor Red
}

# Manter backup por segurança
Write-Host ""
Write-Host "Backup do pg_hba.conf salvo em: $PGHBA_BACKUP" -ForegroundColor Cyan

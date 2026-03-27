# ============================================================================
# Script Completo - Setup Automático PostgreSQL + Base de Dados + Tabelas
# ============================================================================

Write-Host "=== Setup Completo Automático vmLirandzu ===" -ForegroundColor Green
Write-Host ""

$ErrorActionPreference = "Stop"

# Configurações
$POSTGRES_USER = "postgres"
$POSTGRES_PASSWORD = "admin"
$DATABASE_NAME = "lirandzo_db"
$CONTAINER_NAME = "lirandzo-postgres"
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot

Write-Host "1. Verificando Docker..." -ForegroundColor Yellow

try {
    docker --version | Out-Null
    Write-Host "   Docker encontrado!" -ForegroundColor Green
} catch {
    Write-Host "   ERRO: Docker não está instalado ou não está rodando!" -ForegroundColor Red
    Write-Host "   Por favor, instale Docker Desktop e inicie-o." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "2. Verificando/Iniciando container PostgreSQL..." -ForegroundColor Yellow

# Verificar se container existe
$containerExists = docker ps -a --filter "name=$CONTAINER_NAME" --format "{{.Names}}" 2>$null

if ($containerExists -eq $CONTAINER_NAME) {
    # Container existe, verificar se está rodando
    $containerRunning = docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}" 2>$null
    
    if ($containerRunning -eq $CONTAINER_NAME) {
        Write-Host "   Container já está rodando!" -ForegroundColor Green
    } else {
        Write-Host "   Iniciando container..." -ForegroundColor Cyan
        docker start $CONTAINER_NAME
        Start-Sleep -Seconds 5
    }
} else {
    Write-Host "   Criando e iniciando container..." -ForegroundColor Cyan
    Set-Location $PROJECT_ROOT
    docker-compose up postgres -d
    Start-Sleep -Seconds 10
}

# Verificar se está rodando
$containerRunning = docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}" 2>$null
if ($containerRunning -ne $CONTAINER_NAME) {
    Write-Host "   ERRO: Container não está rodando!" -ForegroundColor Red
    Write-Host "   Verifique os logs: docker logs $CONTAINER_NAME" -ForegroundColor Yellow
    exit 1
}

Write-Host "   Container PostgreSQL está rodando!" -ForegroundColor Green

Write-Host ""
Write-Host "3. Aguardando PostgreSQL estar pronto..." -ForegroundColor Yellow

$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    $result = docker exec -e PGPASSWORD=$POSTGRES_PASSWORD $CONTAINER_NAME psql -U $POSTGRES_USER -d postgres -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $ready = $true
        Write-Host "   PostgreSQL está pronto!" -ForegroundColor Green
    } else {
        $attempt++
        Write-Host "   Aguardando... ($attempt/$maxAttempts)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $ready) {
    Write-Host "   ERRO: PostgreSQL não ficou pronto a tempo!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "4. Criando base de dados '$DATABASE_NAME'..." -ForegroundColor Yellow

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

$result = docker exec -e PGPASSWORD=$POSTGRES_PASSWORD $CONTAINER_NAME psql -U $POSTGRES_USER -d postgres -c $createDbSql 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Base de dados criada com sucesso!" -ForegroundColor Green
} elseif ($result -match "already exists") {
    Write-Host "   Base de dados já existe (OK)" -ForegroundColor Yellow
} else {
    Write-Host "   Aviso: $result" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "5. Criando tabelas..." -ForegroundColor Yellow

$tablesScript = Join-Path $PROJECT_ROOT "lirandzo-backend\scripts\create-tables-only.sql"

if (-not (Test-Path $tablesScript)) {
    Write-Host "   ERRO: Script de tabelas não encontrado em $tablesScript" -ForegroundColor Red
    exit 1
}

# Copiar script para container
$tempScript = [System.IO.Path]::GetTempFileName()
Copy-Item $tablesScript $tempScript -Force

docker cp $tempScript "${CONTAINER_NAME}:/tmp/create-tables.sql" | Out-Null

# Executar script
$result = docker exec -e PGPASSWORD=$POSTGRES_PASSWORD $CONTAINER_NAME psql -U $POSTGRES_USER -d $DATABASE_NAME -f /tmp/create-tables.sql 2>&1

Remove-Item $tempScript -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Tabelas criadas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "   Aviso: Pode ter havido erros (tabelas podem já existir)" -ForegroundColor Yellow
    Write-Host "   Resultado: $result" -ForegroundColor Gray
}

Write-Host ""
Write-Host "6. Verificando tabelas criadas..." -ForegroundColor Yellow

$tables = docker exec -e PGPASSWORD=$POSTGRES_PASSWORD $CONTAINER_NAME psql -U $POSTGRES_USER -d $DATABASE_NAME -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" 2>&1

if ($LASTEXITCODE -eq 0) {
    $tableList = ($tables -split "`n" | Where-Object { $_.Trim() -ne "" } | ForEach-Object { $_.Trim() })
    Write-Host "   Tabelas encontradas: $($tableList.Count)" -ForegroundColor Green
    foreach ($table in $tableList) {
        Write-Host "     - $table" -ForegroundColor Cyan
    }
} else {
    Write-Host "   Aviso: Não foi possível listar tabelas" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Setup Completo Concluído! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Configuração:" -ForegroundColor Cyan
Write-Host "  Container: $CONTAINER_NAME" -ForegroundColor White
Write-Host "  Usuário: $POSTGRES_USER" -ForegroundColor White
Write-Host "  Password: $POSTGRES_PASSWORD" -ForegroundColor White
Write-Host "  Base de dados: $DATABASE_NAME" -ForegroundColor White
Write-Host "  Porta: 5433 (host) -> 5432 (container)" -ForegroundColor White
Write-Host ""
Write-Host "Para testar conexão:" -ForegroundColor Yellow
Write-Host "  docker exec -it $CONTAINER_NAME psql -U $POSTGRES_USER -d $DATABASE_NAME" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximo passo: Iniciar o backend Spring Boot!" -ForegroundColor Green

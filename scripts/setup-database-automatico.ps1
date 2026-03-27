# ============================================================================
# Script Automático - Criar Base de Dados e Tabelas
# Funciona com Docker OU PostgreSQL Local
# ============================================================================

Write-Host "=== Setup Automático Base de Dados vmLirandzu ===" -ForegroundColor Green
Write-Host ""

$POSTGRES_USER = "postgres"
$POSTGRES_PASSWORD = "admin"
$DATABASE_NAME = "lirandzo_db"
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot

# Verificar se Docker está disponível
$dockerAvailable = $false
try {
    docker ps 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $dockerAvailable = $true
    }
} catch {
    $dockerAvailable = $false
}

$useDocker = $false
$psqlPath = $null

if ($dockerAvailable) {
    Write-Host "Docker detectado. Tentando usar Docker..." -ForegroundColor Yellow
    
    # Verificar se container existe e está rodando
    $containerName = "lirandzo-postgres"
    $containerRunning = docker ps --filter "name=$containerName" --format "{{.Names}}" 2>$null
    
    if ($containerRunning -eq $containerName) {
        Write-Host "Container Docker está rodando!" -ForegroundColor Green
        $useDocker = $true
    } else {
        Write-Host "Container Docker não está rodando. Usando PostgreSQL local..." -ForegroundColor Yellow
    }
}

# Se não usar Docker, usar PostgreSQL local
if (-not $useDocker) {
    Write-Host ""
    Write-Host "Usando PostgreSQL local..." -ForegroundColor Yellow
    
    # Procurar psql
    $psqlPaths = @(
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe"
    )
    
    foreach ($path in $psqlPaths) {
        if (Test-Path $path) {
            $psqlPath = $path
            Write-Host "PostgreSQL encontrado: $path" -ForegroundColor Green
            break
        }
    }
    
    if (-not $psqlPath) {
        Write-Host "ERRO: PostgreSQL não encontrado!" -ForegroundColor Red
        Write-Host "Por favor, instale PostgreSQL ou inicie Docker Desktop." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "1. Criando base de dados '$DATABASE_NAME'..." -ForegroundColor Yellow

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

if ($useDocker) {
    # Usar Docker
    $result = docker exec -e PGPASSWORD=$POSTGRES_PASSWORD $containerName psql -U $POSTGRES_USER -d postgres -c $createDbSql 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Base de dados criada com sucesso!" -ForegroundColor Green
    } elseif ($result -match "already exists") {
        Write-Host "   Base de dados já existe (OK)" -ForegroundColor Yellow
    } else {
        Write-Host "   Aviso: $result" -ForegroundColor Yellow
    }
} else {
    # Usar PostgreSQL local
    $env:PGPASSWORD = $POSTGRES_PASSWORD
    $result = & $psqlPath -U $POSTGRES_USER -h localhost -p 5432 -d postgres -c $createDbSql 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Base de dados criada com sucesso!" -ForegroundColor Green
    } elseif ($result -match "already exists" -or $result -match "já existe") {
        Write-Host "   Base de dados já existe (OK)" -ForegroundColor Yellow
    } else {
        Write-Host "   Aviso: $result" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "2. Criando tabelas..." -ForegroundColor Yellow

$tablesScript = Join-Path $PROJECT_ROOT "lirandzo-backend\scripts\create-tables-only.sql"

if (-not (Test-Path $tablesScript)) {
    Write-Host "   ERRO: Script não encontrado em $tablesScript" -ForegroundColor Red
    exit 1
}

if ($useDocker) {
    # Usar Docker
    $tempScript = [System.IO.Path]::GetTempFileName()
    Copy-Item $tablesScript $tempScript -Force
    docker cp $tempScript "${containerName}:/tmp/create-tables.sql" | Out-Null
    
    $result = docker exec -e PGPASSWORD=$POSTGRES_PASSWORD $containerName psql -U $POSTGRES_USER -d $DATABASE_NAME -f /tmp/create-tables.sql 2>&1
    
    Remove-Item $tempScript -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Tabelas criadas com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "   Aviso: Pode ter havido erros (tabelas podem já existir)" -ForegroundColor Yellow
    }
    
    # Verificar tabelas
    Write-Host ""
    Write-Host "3. Verificando tabelas..." -ForegroundColor Yellow
    $tables = docker exec -e PGPASSWORD=$POSTGRES_PASSWORD $containerName psql -U $POSTGRES_USER -d $DATABASE_NAME -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $tableList = ($tables -split "`n" | Where-Object { $_.Trim() -ne "" } | ForEach-Object { $_.Trim() })
        Write-Host "   Tabelas encontradas: $($tableList.Count)" -ForegroundColor Green
        foreach ($table in $tableList) {
            Write-Host "     - $table" -ForegroundColor Cyan
        }
    }
} else {
    # Usar PostgreSQL local
    $env:PGPASSWORD = $POSTGRES_PASSWORD
    $result = & $psqlPath -U $POSTGRES_USER -h localhost -p 5432 -d $DATABASE_NAME -f $tablesScript 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Tabelas criadas com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "   Aviso: Pode ter havido erros (tabelas podem já existir)" -ForegroundColor Yellow
        Write-Host "   Resultado: $result" -ForegroundColor Gray
    }
    
    # Verificar tabelas
    Write-Host ""
    Write-Host "3. Verificando tabelas..." -ForegroundColor Yellow
    $tables = & $psqlPath -U $POSTGRES_USER -h localhost -p 5432 -d $DATABASE_NAME -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $tableList = ($tables -split "`n" | Where-Object { $_.Trim() -ne "" } | ForEach-Object { $_.Trim() })
        Write-Host "   Tabelas encontradas: $($tableList.Count)" -ForegroundColor Green
        foreach ($table in $tableList) {
            Write-Host "     - $table" -ForegroundColor Cyan
        }
    }
}

Write-Host ""
Write-Host "=== Setup Concluído! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Configuração:" -ForegroundColor Cyan
if ($useDocker) {
    Write-Host "  Modo: Docker" -ForegroundColor White
    Write-Host "  Container: $containerName" -ForegroundColor White
    Write-Host "  Porta: 5433 (host) -> 5432 (container)" -ForegroundColor White
} else {
    Write-Host "  Modo: PostgreSQL Local" -ForegroundColor White
    Write-Host "  Porta: 5432" -ForegroundColor White
}
Write-Host "  Usuário: $POSTGRES_USER" -ForegroundColor White
Write-Host "  Password: $POSTGRES_PASSWORD" -ForegroundColor White
Write-Host "  Base de dados: $DATABASE_NAME" -ForegroundColor White
Write-Host ""
Write-Host "Próximo passo: Iniciar o backend Spring Boot!" -ForegroundColor Green

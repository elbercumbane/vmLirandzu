# ============================================================================
# Script para configurar PostgreSQL e criar base de dados vmLirandzu
# ============================================================================

Write-Host "=== Configuração PostgreSQL para vmLirandzu ===" -ForegroundColor Green
Write-Host ""

$ErrorActionPreference = "Stop"

# Configurações
$POSTGRES_USER = "postgres"
$POSTGRES_PASSWORD = "admin"
$DATABASE_NAME = "lirandzo_db"
$POSTGRES_PORT = "5433"

# Função para verificar se PostgreSQL está instalado localmente
function Test-PostgreSQLInstalled {
    try {
        $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
        if ($psqlPath) {
            return $true
        }
        return $false
    } catch {
        return $false
    }
}

# Função para verificar se Docker está disponível
function Test-DockerAvailable {
    try {
        docker --version | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Função para verificar se container Docker está rodando
function Test-PostgreSQLDocker {
    try {
        $container = docker ps -a --filter "name=lirandzo-postgres" --format "{{.Names}}" 2>$null
        if ($container -eq "lirandzo-postgres") {
            $running = docker ps --filter "name=lirandzo-postgres" --format "{{.Names}}" 2>$null
            if ($running -eq "lirandzo-postgres") {
                return "running"
            }
            return "stopped"
        }
        return "not_exists"
    } catch {
        return "not_exists"
    }
}

# Função para configurar password do PostgreSQL local
function Set-PostgreSQLPassword {
    param(
        [string]$Password
    )
    
    Write-Host "Configurando password do PostgreSQL..." -ForegroundColor Yellow
    
    # Tentar alterar password via psql
    $env:PGPASSWORD = $Password
    $sql = "ALTER USER $POSTGRES_USER WITH PASSWORD '$Password';"
    
    try {
        psql -U $POSTGRES_USER -h localhost -p $POSTGRES_PORT -c $sql 2>&1 | Out-Null
        Write-Host "Password configurada com sucesso!" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "Aviso: Não foi possível configurar password automaticamente." -ForegroundColor Yellow
        Write-Host "Por favor, configure manualmente:" -ForegroundColor Yellow
        Write-Host "  psql -U $POSTGRES_USER -h localhost -p $POSTGRES_PORT" -ForegroundColor Cyan
        Write-Host "  ALTER USER $POSTGRES_USER WITH PASSWORD '$Password';" -ForegroundColor Cyan
        return $false
    }
}

# Função para criar base de dados e executar script SQL
function Initialize-Database {
    param(
        [string]$ScriptPath
    )
    
    Write-Host "Criando base de dados e tabelas..." -ForegroundColor Yellow
    
    # Ler script SQL e remover comando \c (não funciona em SQL puro)
    $sqlContent = Get-Content $ScriptPath -Raw
    $sqlContent = $sqlContent -replace '\\c lirandzo_db;', ''
    
    # Criar base de dados primeiro
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
    
    try {
        # Criar base de dados
        Write-Host "Criando base de dados '$DATABASE_NAME'..." -ForegroundColor Cyan
        $env:PGPASSWORD = $POSTGRES_PASSWORD
        psql -U $POSTGRES_USER -h localhost -p $POSTGRES_PORT -d postgres -c $createDbSql 2>&1 | Out-Null
        
        if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne 1) {
            Write-Host "Aviso: Base de dados pode já existir ou houve erro." -ForegroundColor Yellow
        } else {
            Write-Host "Base de dados criada com sucesso!" -ForegroundColor Green
        }
        
        # Executar script SQL na base de dados criada
        Write-Host "Executando script SQL para criar tabelas..." -ForegroundColor Cyan
        psql -U $POSTGRES_USER -h localhost -p $POSTGRES_PORT -d $DATABASE_NAME -f $ScriptPath 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Tabelas criadas com sucesso!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Aviso: Pode ter havido erros ao criar tabelas (podem já existir)." -ForegroundColor Yellow
            return $true
        }
    } catch {
        Write-Host "Erro ao executar script SQL: $_" -ForegroundColor Red
        return $false
    }
}

# Função para usar Docker
function Setup-PostgreSQLDocker {
    Write-Host "Usando Docker para PostgreSQL..." -ForegroundColor Yellow
    
    $dockerStatus = Test-PostgreSQLDocker
    
    if ($dockerStatus -eq "running") {
        Write-Host "Container Docker já está rodando!" -ForegroundColor Green
    } elseif ($dockerStatus -eq "stopped") {
        Write-Host "Iniciando container Docker..." -ForegroundColor Yellow
        docker start lirandzo-postgres
        Start-Sleep -Seconds 5
    } else {
        Write-Host "Criando container Docker..." -ForegroundColor Yellow
        docker-compose up postgres -d
        Start-Sleep -Seconds 10
    }
    
    # Verificar se está rodando
    $running = docker ps --filter "name=lirandzo-postgres" --format "{{.Names}}" 2>$null
    if ($running -eq "lirandzo-postgres") {
        Write-Host "Container Docker está rodando!" -ForegroundColor Green
        
        # Executar script SQL via Docker
        Write-Host "Executando script SQL via Docker..." -ForegroundColor Yellow
        $scriptPath = Join-Path $PSScriptRoot "..\lirandzo-backend\scripts\init-database.sql"
        
        # Ler e adaptar script
        $sqlContent = Get-Content $scriptPath -Raw
        $sqlContent = $sqlContent -replace '\\c lirandzo_db;', ''
        
        # Criar base de dados primeiro
        docker exec -e PGPASSWORD=$POSTGRES_PASSWORD lirandzo-postgres psql -U $POSTGRES_USER -d postgres -c "CREATE DATABASE $DATABASE_NAME WITH OWNER = $POSTGRES_USER ENCODING = 'UTF8';" 2>&1 | Out-Null
        
        # Executar script SQL
        $tempFile = [System.IO.Path]::GetTempFileName()
        $sqlContent | Out-File -FilePath $tempFile -Encoding UTF8
        
        docker cp $tempFile lirandzo-postgres:/tmp/init.sql
        docker exec -e PGPASSWORD=$POSTGRES_PASSWORD lirandzo-postgres psql -U $POSTGRES_USER -d $DATABASE_NAME -f /tmp/init.sql 2>&1 | Out-Null
        
        Remove-Item $tempFile -ErrorAction SilentlyContinue
        
        Write-Host "Base de dados e tabelas criadas via Docker!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "Erro: Container Docker não está rodando!" -ForegroundColor Red
        return $false
    }
}

# ============================================================================
# EXECUÇÃO PRINCIPAL
# ============================================================================

Write-Host "Verificando instalação do PostgreSQL..." -ForegroundColor Cyan

$postgresInstalled = Test-PostgreSQLInstalled
$dockerAvailable = Test-DockerAvailable

if ($postgresInstalled) {
    Write-Host "PostgreSQL está instalado localmente!" -ForegroundColor Green
    
    # Tentar configurar password
    Set-PostgreSQLPassword -Password $POSTGRES_PASSWORD
    
    # Executar script SQL
    $scriptPath = Join-Path $PSScriptRoot "..\lirandzo-backend\scripts\init-database.sql"
    if (Test-Path $scriptPath) {
        Initialize-Database -ScriptPath $scriptPath
    } else {
        Write-Host "Erro: Script SQL não encontrado em $scriptPath" -ForegroundColor Red
    }
} elseif ($dockerAvailable) {
    Write-Host "PostgreSQL não está instalado localmente, usando Docker..." -ForegroundColor Yellow
    Setup-PostgreSQLDocker
} else {
    Write-Host "Erro: PostgreSQL não está instalado e Docker não está disponível!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Yellow
    Write-Host "1. Instalar PostgreSQL localmente:" -ForegroundColor Cyan
    Write-Host "   .\scripts\instalar-postgresql.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Instalar Docker Desktop e executar:" -ForegroundColor Cyan
    Write-Host "   docker-compose up postgres -d" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "=== Configuração concluída! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Credenciais configuradas:" -ForegroundColor Cyan
Write-Host "  Usuário: $POSTGRES_USER" -ForegroundColor White
Write-Host "  Password: $POSTGRES_PASSWORD" -ForegroundColor White
Write-Host "  Base de dados: $DATABASE_NAME" -ForegroundColor White
Write-Host "  Porta: $POSTGRES_PORT" -ForegroundColor White
Write-Host ""
Write-Host "Para testar conexão:" -ForegroundColor Yellow
if ($postgresInstalled) {
    Write-Host "  psql -U $POSTGRES_USER -h localhost -p $POSTGRES_PORT -d $DATABASE_NAME" -ForegroundColor Cyan
} else {
    Write-Host "  docker exec -it lirandzo-postgres psql -U $POSTGRES_USER -d $DATABASE_NAME" -ForegroundColor Cyan
}

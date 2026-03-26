# Script para instalar PostgreSQL no Windows
# Requer execução como Administrador

Write-Host "=== Instalação do PostgreSQL ===" -ForegroundColor Green

$installerPath = "$env:TEMP\postgresql-installer.exe"

# Verificar se o instalador existe
if (-not (Test-Path $installerPath)) {
    Write-Host "Erro: Instalador não encontrado em $installerPath" -ForegroundColor Red
    Write-Host "Baixando instalador..." -ForegroundColor Yellow
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri "https://get.enterprisedb.com/postgresql/postgresql-16.1-1-windows-x64.exe" -OutFile $installerPath
}

Write-Host "Instalador encontrado: $installerPath" -ForegroundColor Green

# Verificar se está executando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "AVISO: Este script requer permissões de Administrador!" -ForegroundColor Yellow
    Write-Host "Por favor, execute o PowerShell como Administrador e execute novamente." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ou execute manualmente:" -ForegroundColor Cyan
    Write-Host "Start-Process '$installerPath' -Verb RunAs" -ForegroundColor Cyan
    exit 1
}

Write-Host "Iniciando instalação do PostgreSQL..." -ForegroundColor Green
Write-Host "Configurações:" -ForegroundColor Cyan
Write-Host "  - Porta: 5433" -ForegroundColor Cyan
Write-Host "  - Usuário: postgres" -ForegroundColor Cyan
Write-Host "  - Senha: admin123" -ForegroundColor Cyan
Write-Host ""

# Executar instalador
# Nota: O instalador do PostgreSQL não suporta instalação totalmente silenciosa
# Será necessário interação manual durante a instalação
Start-Process $installerPath -Wait

Write-Host ""
Write-Host "Instalação concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Adicionar PostgreSQL ao PATH (se necessário)" -ForegroundColor Cyan
Write-Host "2. Iniciar serviço PostgreSQL" -ForegroundColor Cyan
Write-Host "3. Criar base de dados lirandzo_db" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comandos úteis:" -ForegroundColor Yellow
Write-Host "  Get-Service -Name '*postgresql*'" -ForegroundColor Cyan
Write-Host "  Start-Service postgresql-x64-16" -ForegroundColor Cyan
Write-Host "  psql -U postgres -h localhost -p 5433" -ForegroundColor Cyan

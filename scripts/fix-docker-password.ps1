# Script para garantir que password do Docker PostgreSQL está correta
Write-Host "=== Corrigindo Password Docker PostgreSQL ===" -ForegroundColor Green
Write-Host ""

# Parar container
Write-Host "1. Parando container..." -ForegroundColor Yellow
docker stop lirandzo-postgres 2>&1 | Out-Null

# Remover container (mas manter volume)
Write-Host "2. Removendo container (mantendo dados)..." -ForegroundColor Yellow
docker rm lirandzo-postgres 2>&1 | Out-Null

# Recriar container com password correta
Write-Host "3. Recriando container com password 'admin'..." -ForegroundColor Yellow
cd "C:\Users\Elber Elizio\Desktop\DAP PROJECTOS\vmLirandzu"
docker-compose up postgres -d

# Aguardar PostgreSQL estar pronto
Write-Host "4. Aguardando PostgreSQL estar pronto..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar conexão
Write-Host "5. Verificando conexão..." -ForegroundColor Yellow
$result = docker exec -e PGPASSWORD=admin lirandzo-postgres psql -U postgres -d lirandzo_db -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Conexão bem-sucedida!" -ForegroundColor Green
    Write-Host "   $result" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "=== Pronto! Agora pode iniciar o backend ===" -ForegroundColor Green
} else {
    Write-Host "   Erro ao verificar conexão" -ForegroundColor Red
}

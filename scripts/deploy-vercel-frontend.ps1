param(
    [switch]$SkipInstall,
    [switch]$Yes
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendPath = Join-Path $repoRoot "lirandzo-app"
$vercelConfigPath = Join-Path $frontendPath "vercel.json"

if (-not (Test-Path $frontendPath)) {
    throw "Pasta do frontend não encontrada: $frontendPath"
}

if (-not (Test-Path $vercelConfigPath)) {
    throw "Arquivo obrigatório não encontrado: $vercelConfigPath"
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm não encontrado no PATH. Instala o Node.js e tenta novamente."
}

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    throw "CLI do Vercel não encontrada. Instala com: npm i -g vercel"
}

Set-Location $frontendPath

if (-not $SkipInstall) {
    Write-Step "Instalar dependências (npm install)"
    npm install
}

Write-Step "Gerar build de produção (npm run build)"
npm run build

Write-Step "Fazer deploy manual no Vercel (produção)"
if ($Yes) {
    vercel --prod --yes
} else {
    vercel --prod
}

Write-Host ""
Write-Host "Deploy concluído. Verifica o domínio e testa: /api/health" -ForegroundColor Green

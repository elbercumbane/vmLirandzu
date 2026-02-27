@echo off
echo ========================================
echo   Instalacao do Angular 19 - VM Lirandzu
echo ========================================
echo.

echo [1/4] Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale Node.js de https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js encontrado!
echo.

echo [2/4] Instalando Angular CLI 19...
call npm install -g @angular/cli@19
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar Angular CLI
    pause
    exit /b 1
)
echo Angular CLI instalado com sucesso!
echo.

echo [3/4] Verificando instalacao...
call ng version
echo.

echo [4/4] Instalando dependencias do projeto...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)
echo.
echo ========================================
echo   Instalacao concluida com sucesso!
echo ========================================
echo.
echo Para executar o projeto, use:
echo   ng serve
echo.
echo Ou simplesmente:
echo   npm start
echo.
pause

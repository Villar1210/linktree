@echo off
echo ================================
echo  Lumiar Imóveis - Linktree Setup
echo ================================
echo.

REM Verificar se Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Python não encontrado! Por favor, instale Python 3.7 ou superior.
    pause
    exit /b 1
)

echo [1/5] Python encontrado!

REM Criar ambiente virtual se não existir
if not exist "venv" (
    echo [2/5] Criando ambiente virtual...
    python -m venv venv
) else (
    echo [2/5] Ambiente virtual já existe.
)

REM Ativar ambiente virtual
echo [3/5] Ativando ambiente virtual...
call venv\Scripts\activate.bat

REM Instalar dependências
echo [4/5] Instalando dependências...
pip install -r requirements.txt

REM Criar arquivo .env se não existir
if not exist ".env" (
    echo [5/5] Criando arquivo de configuração...
    copy .env.example .env
    echo.
    echo IMPORTANTE: Edite o arquivo .env com seus números de WhatsApp!
    echo.
) else (
    echo [5/5] Arquivo .env já existe.
)

echo.
echo ================================
echo  Setup concluído com sucesso!
echo ================================
echo.
echo Para executar a aplicação:
echo   1. Execute: run.bat
echo   2. Ou manualmente: python app.py
echo.
echo Não esqueça de:
echo   - Editar o arquivo .env com seus números de WhatsApp
echo   - Adicionar seu logo em static/images/logo.png
echo   - Adicionar fotos dos imóveis em static/images/
echo.
pause
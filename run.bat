@echo off
echo ================================
echo  Lumiar Imóveis - Linktree
echo ================================
echo.

REM Verificar se o ambiente virtual existe
if not exist "venv" (
    echo ERRO: Ambiente virtual não encontrado!
    echo Execute primeiro: setup.bat
    pause
    exit /b 1
)

REM Ativar ambiente virtual
call venv\Scripts\activate.bat

REM Verificar se o arquivo .env existe
if not exist ".env" (
    echo AVISO: Arquivo .env não encontrado!
    echo Usando configurações padrão...
    echo.
)

echo Iniciando servidor Flask...
echo.
echo Acesse: http://localhost:5000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

REM Executar aplicação
python app.py
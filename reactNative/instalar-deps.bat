@echo off
cls
echo ==========================================================
echo       SCRIPT DE INSTALACAO E INICIO - PATEANDO-APP
echo ==========================================================
echo.

:: 1. Muda o diretorio para a pasta onde este script .bat esta localizado.
:: Isso torna o script portatil e independente de onde o projeto esta.
cd /d "%~dp0"
echo O script esta rodando na pasta: %cd%
echo.

echo ==========================================================
echo [PASSO 1 de 2] Instalando todas as dependencias...
echo Isso pode levar alguns minutos.
echo ==========================================================
echo.

:: 2. Instala TODAS as dependencias listadas no arquivo package.json
:: Este e o metodo padrao e recomendado.
npm install

:: Verifica se a instalacao foi bem sucedida
if %errorlevel% neq 0 (
    echo.
    echo ==========================================================
    echo OCORREU UM ERRO DURANTE A INSTALACAO DAS DEPENDENCIAS!
    echo Verifique as mensagens de erro acima.
    echo ==========================================================
    pause
    exit /b %errorlevel%
)

echo.
echo ==========================================================
echo [SUCESSO!] Todas as dependencias foram instaladas.
echo ==========================================================
echo.

echo ==========================================================
echo [PASSO 2 de 2] Iniciando o servidor de desenvolvimento...
echo ==========================================================
echo.

:: 3. Inicia o servidor do Expo com o cache limpo (-c)
npx expo start -c

echo.
echo O servidor foi iniciado. Voce pode fechar esta janela.
pause
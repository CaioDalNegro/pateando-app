@echo off
cls
echo ==========================================================
echo       SCRIPT DE INSTALACAO COMPLETO - PATEANDO-APP
echo ==========================================================
echo.
echo Este script ira instalar TODAS as bibliotecas necessarias
echo para o projeto React Native.
echo.

:: Muda o diretorio para a pasta onde este script .bat esta localizado.
cd /d "%~dp0"
echo O script esta rodando na pasta: %cd%
echo.

echo ==========================================================
echo                INICIANDO A INSTALACAO...
echo      Isso pode levar alguns minutos. Aguarde...
echo ==========================================================
echo.

:: -----------------------------------------------------------------------------------
:: COMANDO UNICO COM TODAS AS DEPENDENCIAS QUE UTILIZAMOS NO PROJETO
:: -----------------------------------------------------------------------------------
npm install axios @react-native-async-storage/async-storage @react-navigation/native @react-navigation/stack react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context expo-linear-gradient react-native-maps expo-location @react-native-community/datetimepicker react-native-calendars expo-haptics @expo/vector-icons

:: Verifica se a instalacao foi bem sucedida
if %errorlevel% neq 0 (
    echo.
    echo ==========================================================
    echo      X OCORREU UM ERRO DURANTE A INSTALACAO! X
    echo Verifique as mensagens de erro acima no terminal.
    echo ==========================================================
    pause
    exit /b %errorlevel%
)

echo.
echo ==========================================================
echo   [SUCESSO!] Todas as dependencias foram instaladas.
echo ==========================================================
echo.
echo Voce ja pode iniciar o projeto com o comando: npx expo start -c
echo.

:: Mantem a janela aberta para o usuario ver a mensagem de sucesso.
pause
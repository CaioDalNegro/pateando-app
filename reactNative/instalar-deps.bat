@echo off
echo =====================================
echo Instalando dependencias do projeto...
echo =====================================

:: Acessa a pasta do projeto (onde está o package.json)
cd /d "c:\Users\Aluno\Desktop\pateando-app\reactNative"

:: Executa o comando npm install com legacy peer deps
npm install --legacy-peer-deps axios 

echo.
echo =====================================
echo Dependencias instaladas com sucesso!
echo =====================================
pause

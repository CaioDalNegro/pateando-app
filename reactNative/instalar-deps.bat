@echo off
echo =====================================
echo Instalando dependencias do projeto...
echo =====================================

:: acessa a pasta do projeto (onde está o package.json)
cd /d "c:\Users\Aluno\Desktop\pateando-app\reactNative"

:: instala todas as dependencias usadas no projeto
npm install --legacy-peer-deps axios @react-native-async-storage/async-storage @react-navigation/native @react-navigation/stack react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @expo/vector-icons


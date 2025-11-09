@echo off
echo ========================================
echo    Sistema Academico PIM - Build Script
echo ========================================

echo.
echo [1/4] Instalando dependencias do backend...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do backend
    exit /b 1
)

echo.
echo [2/4] Compilando modulo C de calculo de notas...
cd calculations
gcc -shared -fPIC -o grade_calculator.dll grade_calculator.c
if %errorlevel% neq 0 (
    echo Aviso: Nao foi possivel compilar o modulo C. Usando fallback Python.
)
cd ..

echo.
echo [3/4] Instalando dependencias do frontend...
cd ..\frontend
npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do frontend
    exit /b 1
)

echo.
echo [4/4] Construindo frontend para producao...
npm run build
if %errorlevel% neq 0 (
    echo Erro ao construir frontend
    exit /b 1
)

cd ..
echo.
echo ========================================
echo    Build concluido com sucesso!
echo ========================================
echo.
echo Para executar o sistema:
echo   1. Backend: cd backend ^&^& python main.py
echo   2. Frontend: cd frontend ^&^& npm run preview
echo.
pause

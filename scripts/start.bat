@echo off
echo ========================================
echo      Planner Edu - Iniciando
echo ========================================

echo.
echo Iniciando backend (FastAPI)...
start "Backend - Planner Edu" cmd /k "cd backend && python main.py"

timeout /t 3 /nobreak > nul

echo.
echo Iniciando frontend (React + Vite)...
start "Frontend - Planner Edu" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo    Planner Edu iniciado com sucesso!
echo ========================================
echo.
echo URLs de acesso:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000
echo   Documentacao API: http://localhost:8000/docs
echo.
echo Pressione qualquer tecla para fechar este terminal...
pause > nul

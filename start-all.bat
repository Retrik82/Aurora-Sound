@echo off
setlocal
cd /d %~dp0

if not exist "backend\app\main.py" (
  echo [ERROR] Backend folder is missing. Expected: %~dp0backend
  exit /b 1
)

if not exist "frontend\package.json" (
  echo [ERROR] Frontend package.json not found.
  echo         Run frontend commands from: %~dp0frontend
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is not available in PATH. Install Node.js and reopen terminal.
  exit /b 1
)

start "Aurora Backend" cmd /k start-backend.bat
start "Aurora Frontend" cmd /k start-frontend.bat
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000

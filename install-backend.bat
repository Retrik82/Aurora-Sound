@echo off
setlocal
cd /d %~dp0backend
if not exist .venv\Scripts\python.exe py -m venv .venv
if errorlevel 1 python -m venv .venv
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\pip.exe install -r requirements.txt
echo.
echo Backend dependencies installed.
echo Start backend with: start-backend.bat

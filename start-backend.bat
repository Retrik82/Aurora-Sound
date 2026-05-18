@echo off
setlocal
cd /d %~dp0backend
if not exist .env copy ..\.env.example .env
if not exist .venv\Scripts\python.exe (
  echo Backend venv not found. Installing dependencies...
  py -m venv .venv
  if errorlevel 1 python -m venv .venv
  .venv\Scripts\python.exe -m pip install --upgrade pip
  .venv\Scripts\pip.exe install -r requirements.txt
)
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

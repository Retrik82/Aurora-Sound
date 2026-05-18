@echo off
setlocal
cd /d %~dp0frontend
if not exist package.json (
  echo [ERROR] package.json not found in %cd%
  echo         Expected frontend path: %~dp0frontend
  exit /b 1
)
if not exist node_modules npm install
npm run dev

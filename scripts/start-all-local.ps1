$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backendScript = Join-Path $root "scripts\start-backend.ps1"
$frontendScript = Join-Path $root "scripts\start-frontend.ps1"

Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$backendScript`""
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$frontendScript`""

"Started backend and frontend in separate PowerShell windows."
"Frontend: http://localhost:3000"
"Backend docs: http://localhost:8000/docs"

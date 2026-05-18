$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$venv = Join-Path $backend ".venv"
$envFile = Join-Path $backend ".env"
$rootEnvExample = Join-Path $root ".env.example"

if (!(Test-Path -LiteralPath $envFile)) {
  Copy-Item -LiteralPath $rootEnvExample -Destination $envFile
}

Set-Location -LiteralPath $backend
if (!(Test-Path -LiteralPath $venv)) {
  python -m venv .venv
}

& ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\.venv\Scripts\pip.exe" install -r requirements.txt

"Backend setup completed. Run scripts\start-backend.ps1 from the project root."

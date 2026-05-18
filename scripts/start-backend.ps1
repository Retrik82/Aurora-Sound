$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$envFile = Join-Path $backend ".env"
$rootEnvExample = Join-Path $root ".env.example"

if (!(Test-Path -LiteralPath $envFile)) {
  Copy-Item -LiteralPath $rootEnvExample -Destination $envFile
}

Set-Location -LiteralPath $backend
if (!(Test-Path -LiteralPath ".\.venv\Scripts\python.exe")) {
  python -m venv .venv
  & ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
  & ".\.venv\Scripts\pip.exe" install -r requirements.txt
}

& ".\.venv\Scripts\python.exe" -m pip show uvicorn *> $null
if ($LASTEXITCODE -ne 0) {
  & ".\.venv\Scripts\pip.exe" install -r requirements.txt
}

& ".\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

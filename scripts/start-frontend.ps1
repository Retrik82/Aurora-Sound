$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root "frontend"

Set-Location -LiteralPath $frontend
if (!(Test-Path -LiteralPath ".\node_modules")) {
  npm install
}

npm run dev

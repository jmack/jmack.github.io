param(
  [int] $Port = 8765
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot

Write-Host "Serving $repoRoot at http://127.0.0.1:$Port/ (Ctrl+C to stop)" -ForegroundColor Cyan
python -m http.server $Port

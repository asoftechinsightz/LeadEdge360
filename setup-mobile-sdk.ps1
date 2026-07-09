# Run from repo root: powershell -ExecutionPolicy Bypass -File .\setup-mobile-sdk.ps1
$Script = Join-Path $PSScriptRoot "mobile\scripts\setup-android-sdk.ps1"
if (-not (Test-Path $Script)) {
    Write-Host "ERROR: setup script not found at $Script"
    exit 1
}
& $Script @args

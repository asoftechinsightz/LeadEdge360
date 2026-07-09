# Run from repo root: powershell -ExecutionPolicy Bypass -File .\build-mobile-apk.ps1
$MobileRoot = Join-Path $PSScriptRoot "mobile"
$Script = Join-Path $MobileRoot "scripts\build-apk.ps1"
if (-not (Test-Path $Script)) {
    Write-Host "ERROR: mobile build script not found at $Script"
    exit 1
}
& $Script @args

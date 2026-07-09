param(
  [string]$ProjectRoot = (Split-Path $PSScriptRoot -Parent)
)

$ErrorActionPreference = "Stop"
Set-Location $ProjectRoot

$androidApp = Join-Path $ProjectRoot "android\app"
if (-not (Test-Path $androidApp)) {
  Write-Host "android/ not found. Run: flutter create . --org com.asoftechinsightz --project-name asoftech_business_suite --platforms=android"
  exit 1
}

$xmlDest = Join-Path $androidApp "src\main\res\xml"
New-Item -ItemType Directory -Force -Path $xmlDest | Out-Null
Copy-Item "release\android\res\xml\network_security_config.xml" (Join-Path $xmlDest "network_security_config.xml") -Force
Copy-Item "release\android\proguard-rules.pro" (Join-Path $androidApp "proguard-rules.pro") -Force

Write-Host "Copied network_security_config.xml and proguard-rules.pro"
Write-Host ""
Write-Host "Next: edit AndroidManifest.xml and build.gradle - see docs/PLAY_STORE_RELEASE.md"

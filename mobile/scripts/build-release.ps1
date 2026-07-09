param(
  [string]$ApiBaseUrl = "https://asoftechinsightz.com/api",
  [switch]$EnableFcm
)

$ErrorActionPreference = "Stop"
$MobileRoot = Split-Path $PSScriptRoot -Parent
Set-Location $MobileRoot

. (Join-Path $PSScriptRoot "lib\BuildEnv.ps1")
Set-BuildEnvironment -MobileRoot $MobileRoot

$flutter = Find-Flutter
if (-not $flutter) {
    Write-Fail "Flutter SDK not found."
    exit 1
}

Invoke-BuildStep "flutter pub get" { & $flutter pub get | Out-Host }

$defines = @("--dart-define=API_BASE_URL=$ApiBaseUrl")
if ($EnableFcm) { $defines += "--dart-define=ENABLE_FCM=true" }

Invoke-BuildStep "flutter build appbundle --release" {
    & $flutter build appbundle --release @defines | Out-Host
}

$aab = Join-Path $MobileRoot "build\app\outputs\bundle\release\app-release.aab"
Write-Host ""
Write-Host "Output: $aab"
Write-Host "Upload to Google Play Console -> Production -> Create new release"

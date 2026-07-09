# Run once after cloning — generates android/ platform folder
param(
  [switch]$SkipCreate
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) {
  Write-Host "Flutter SDK not found. Install from https://docs.flutter.dev/get-started/install"
  exit 1
}

if (-not $SkipCreate -and -not (Test-Path "android/app/build.gradle")) {
  Write-Host "Generating Android platform files..."
  flutter create . --org com.asoftechinsightz --project-name asoftech_business_suite --platforms=android
}

flutter pub get
flutter analyze
flutter test

if (Test-Path "android\app") {
  Write-Host "Applying Android release config..."
  powershell -ExecutionPolicy Bypass -File scripts/apply-android-release.ps1
}

Write-Host ""
Write-Host "Ready. Run: flutter run --dart-define=API_BASE_URL=https://asoftechinsightz.com/api"
Write-Host "Release AAB: powershell -File scripts/build-release.ps1"

# Build release APK for direct phone installation.
# Run on Windows PC only. Requires Flutter 3.29+, JDK 17, Android SDK 35.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\scripts\build-apk.ps1
#   powershell -ExecutionPolicy Bypass -File .\scripts\build-apk.ps1 -SkipTests
#   powershell -ExecutionPolicy Bypass -File .\scripts\build-apk.ps1 -InstallViaUsb

param(
    [string]$ApiBaseUrl = "https://asoftechinsightz.com/api",
    [switch]$EnableFcm,
    [switch]$SkipTests,
    [switch]$SkipAnalyze,
    [switch]$InstallViaUsb,
    [switch]$PersistEnv
)

$ErrorActionPreference = "Stop"

function Invoke-External {
    param([scriptblock]$Action)
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try { & $Action } finally { $ErrorActionPreference = $prev }
}
$MobileRoot = Split-Path $PSScriptRoot -Parent
Set-Location $MobileRoot

. (Join-Path $PSScriptRoot "lib\BuildEnv.ps1")

Write-Host "========================================" -ForegroundColor White
Write-Host " Asoftech Business Suite - APK Build" -ForegroundColor White
Write-Host "========================================" -ForegroundColor White

Set-BuildEnvironment -MobileRoot $MobileRoot -PersistUserEnv:$PersistEnv

$flutter = Find-Flutter
if (-not $flutter) {
    Write-Fail "Flutter SDK not found. Install: https://docs.flutter.dev/get-started/install/windows"
    exit 1
}
Write-Ok "Flutter=$flutter"

Invoke-BuildStep "Verify Gradle wrapper (SSL + download)" {
    Set-Location (Join-Path $MobileRoot "android")
    Invoke-External { & .\gradlew.bat --version --no-daemon 2>&1 | Out-Host }
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Set-Location $MobileRoot
}

Invoke-BuildStep "Verify Android SDK" {
    $platform = Join-Path $env:ANDROID_SDK_ROOT "platforms\android-35"
    $buildTools = Join-Path $env:ANDROID_SDK_ROOT "build-tools\35.0.1"
    $adb = Join-Path $env:ANDROID_SDK_ROOT "platform-tools\adb.exe"
    foreach ($p in @($platform, $buildTools, $adb)) {
        if (-not (Test-Path $p)) {
            Write-Fail "Missing SDK component: $p"
            Write-Host "Run: powershell -ExecutionPolicy Bypass -File setup-mobile-sdk.ps1"
            exit 1
        }
    }
    $gitExe = Ensure-GitInPath
    if ($gitExe) {
        $gitVersion = & $gitExe --version 2>&1
        Write-Host $gitVersion
    }
    # Do not use flutter doctor exit code here - it returns 1 for optional tools (VS, Android Studio).
}

function Invoke-Flutter {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Command)
    Ensure-GitInPath | Out-Null
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $output = & $flutter @Command 2>&1
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $prev
    $output | Out-Host
    if ($exitCode -ne 0) {
        Write-Fail "Flutter exited with code $exitCode"
        exit $exitCode
    }
}

Invoke-BuildStep "flutter clean" {
    Invoke-Flutter clean
}

Invoke-BuildStep "flutter pub get" {
    Invoke-Flutter pub get
}

if (-not $SkipAnalyze) {
    Invoke-BuildStep "flutter analyze" {
        # Warnings/info (e.g. dead_code in offline fallbacks) must not block release APK.
        Invoke-Flutter analyze --no-fatal-infos --no-fatal-warnings
    }
}

if (-not $SkipTests) {
    Invoke-BuildStep "flutter test" {
        Invoke-Flutter test
    }
}

$defines = @("--dart-define=API_BASE_URL=$ApiBaseUrl")
if ($EnableFcm) { $defines += "--dart-define=ENABLE_FCM=true" }

Invoke-BuildStep "flutter build apk --release" {
    $buildArgs = @("build", "apk", "--release") + $defines
    Invoke-Flutter @buildArgs
}

$apk = Join-Path $MobileRoot "build\app\outputs\flutter-apk\app-release.apk"
if (-not (Test-Path $apk)) {
    $alt = Get-ChildItem -Path (Join-Path $MobileRoot "build") -Recurse -Filter "*.apk" -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match 'release' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($alt) {
        Write-Host "[WARN] Expected path missing; using: $($alt.FullName)"
        $apk = $alt.FullName
    } else {
        Write-Fail "APK not found. Flutter build may have failed silently."
        Write-Host "Expected: $apk"
        Write-Host "Re-run with verbose output: flutter build apk --release -v"
        exit 1
    }
}

$destDir = Join-Path $MobileRoot "release\android"
New-Item -ItemType Directory -Force -Path $destDir | Out-Null
$dest = Join-Path $destDir "app-release.apk"
Copy-Item $apk $dest -Force

$sizeMb = [math]::Round((Get-Item $apk).Length / 1MB, 2)
$sha256 = Get-ApkSha256 $apk

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " BUILD SUCCESSFUL" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "APK path : $apk"
Write-Host "Copy     : $dest"
Write-Host "Size     : $sizeMb MB"
Write-Host "SHA-256  : $sha256"
Write-Host ""
Write-Host "Install on phone:"
Write-Host "  1. Copy app-release.apk to your Android device"
Write-Host "  2. Tap the APK file (not .ps1 scripts)"
Write-Host "  3. Allow install from unknown sources if prompted"

if ($InstallViaUsb) {
    Write-Step "Install via USB (adb)"
    $adb = Join-Path $env:ANDROID_SDK_ROOT "platform-tools\adb.exe"
    if (-not (Test-Path $adb)) {
        Write-Fail "adb not found at $adb"
        exit 1
    }
    & $adb devices
    & $adb install -r $apk
    if ($LASTEXITCODE -eq 0) { Write-Ok "Installed on connected device" }
}

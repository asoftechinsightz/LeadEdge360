# Shared build environment helpers for Flutter Android on Windows.

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Fail {
    param([string]$Message)
    Write-Host "[FAIL] $Message" -ForegroundColor Red
}

function Find-JavaHome {
    if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
        return $env:JAVA_HOME
    }
    $candidates = @(
        "C:\Program Files\Microsoft\jdk-17*",
        "C:\Program Files\Eclipse Adoptium\jdk-17*",
        "C:\Program Files\Java\jdk-17*"
    )
    foreach ($pattern in $candidates) {
        $dir = Get-ChildItem $pattern -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending | Select-Object -First 1
        if ($dir -and (Test-Path "$($dir.FullName)\bin\java.exe")) {
            return $dir.FullName
        }
    }
    return $null
}

function Find-Flutter {
    $paths = @(
        "$env:USERPROFILE\flutter\bin\flutter.bat",
        "$env:LOCALAPPDATA\flutter\bin\flutter.bat"
    )
    foreach ($p in $paths) {
        if (Test-Path $p) { return $p }
    }
    $cmd = Get-Command flutter -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    return $null
}

function Find-Git {
    $cmd = Get-Command git -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    $gitPaths = @(
        "C:\Program Files\Git\cmd\git.exe",
        "C:\Program Files\Git\bin\git.exe",
        "C:\Program Files (x86)\Git\cmd\git.exe",
        "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
    )
    foreach ($p in $gitPaths) {
        if (Test-Path $p) { return $p }
    }

    try {
        $reg = Get-ItemProperty "HKLM:\SOFTWARE\GitForWindows" -ErrorAction SilentlyContinue
        if ($reg.InstallPath) {
            $fromReg = Join-Path $reg.InstallPath "cmd\git.exe"
            if (Test-Path $fromReg) { return $fromReg }
        }
    } catch { }

    return $null
}

function Ensure-GitInPath {
    $git = Find-Git
    if (-not $git) { return $null }
    $gitDir = Split-Path $git -Parent
    if ($env:Path -notlike "*$gitDir*") {
        $env:Path = "$gitDir;" + $env:Path
    }
    return $git
}

function Set-BuildEnvironment {
    param(
        [string]$MobileRoot,
        [switch]$PersistUserEnv
    )

    $javaHome = Find-JavaHome
    if (-not $javaHome) {
        Write-Fail "JDK 17 not found. Install: winget install Microsoft.OpenJDK.17"
        exit 1
    }
    $env:JAVA_HOME = $javaHome
    if ($env:Path -notlike "*$javaHome\bin*") {
        $env:Path = "$javaHome\bin;$env:Path"
    }

    # flutter.bat uses CMD `WHERE git` — System32 must be on PATH.
    $sys32 = Join-Path $env:SystemRoot "System32"
    $psV1 = Join-Path $sys32 "WindowsPowerShell\v1.0"
    foreach ($dir in @($sys32, $psV1)) {
        if ((Test-Path $dir) -and ($env:Path -notlike "*$dir*")) {
            $env:Path = "$dir;$env:Path"
        }
    }

    $sdk = if ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT }
           elseif ($env:ANDROID_HOME) { $env:ANDROID_HOME }
           else { "$env:LOCALAPPDATA\Android\Sdk" }

    if (-not (Test-Path $sdk)) {
        Write-Fail "Android SDK not found at $sdk. Run scripts\setup-android-sdk.ps1"
        exit 1
    }
    $env:ANDROID_SDK_ROOT = $sdk
    $env:ANDROID_HOME = $sdk

    $gitExe = Ensure-GitInPath
    if (-not $gitExe) {
        Write-Fail "Git is required but not found."
        Write-Host "Install: winget install Git.Git"
        Write-Host "Then close and reopen your terminal (CMD/PowerShell)."
        exit 1
    }
    Write-Ok "Git=$gitExe"

    # Persist Git to user PATH so new CMD windows and Flutter child processes find it.
    $gitDir = Split-Path $gitExe -Parent
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($userPath -notlike "*$gitDir*") {
        [Environment]::SetEnvironmentVariable("Path", "$gitDir;$userPath", "User")
    }

  # Root cause fix: antivirus SSL inspection (e.g. AVG) re-signs HTTPS with a cert
  # that Windows trusts but Java default cacerts does not. Use Windows cert store.
    $sslFix = "-Djavax.net.ssl.trustStoreType=Windows-ROOT"
    $existingGradleOpts = $env:GRADLE_OPTS
    if ($existingGradleOpts -notmatch 'trustStoreType=Windows-ROOT') {
        $env:GRADLE_OPTS = if ($existingGradleOpts) { "$existingGradleOpts $sslFix" } else { $sslFix }
    }

    $localProps = Join-Path $MobileRoot "android\local.properties"
    $flutter = Find-Flutter
    if ($flutter -and (Test-Path $flutter)) {
        $flutterSdk = (Resolve-Path (Split-Path (Split-Path $flutter -Parent) -Parent)).Path
        $content = @()
        if (Test-Path $localProps) { $content = Get-Content $localProps }
        $content = $content | Where-Object { $_ -notmatch '^(flutter\.sdk|sdk\.dir)=' }
        $content += "flutter.sdk=$($flutterSdk -replace '\\','\\')"
        $content += "sdk.dir=$($sdk -replace '\\','\\')"
        Set-Content -Path $localProps -Value ($content -join "`n") -Encoding UTF8
    }

    if ($PersistUserEnv) {
        [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "User")
        [Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $sdk, "User")
        [Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdk, "User")
        [Environment]::SetEnvironmentVariable("GRADLE_OPTS", $env:GRADLE_OPTS, "User")
        if ($gitExe) {
            $gitDir = Split-Path $gitExe -Parent
            $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
            if ($userPath -notlike "*$gitDir*") {
                [Environment]::SetEnvironmentVariable("Path", "$gitDir;$userPath", "User")
            }
        }
    }

    Write-Ok "JAVA_HOME=$javaHome"
    Write-Ok "ANDROID_SDK_ROOT=$sdk"
    Write-Ok "Gradle SSL: Windows-ROOT trust store (AV HTTPS scanning compatible)"
}

function Invoke-BuildStep {
    param(
        [string]$Name,
        [scriptblock]$Action
    )
    Write-Step $Name
    & $Action
    if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) {
        Write-Fail "$Name failed (exit $LASTEXITCODE)"
        exit $LASTEXITCODE
    }
    Write-Ok $Name
}

function Get-ApkSha256 {
    param([string]$Path)
    return (Get-FileHash -Path $Path -Algorithm SHA256).Hash
}

param(
  [string]$SdkRoot = "$env:LOCALAPPDATA\Android\Sdk",
  [int]$PlatformApi = 35,
  [string]$BuildTools = "35.0.1"
)

$ErrorActionPreference = "Stop"

function Ensure-Java {
  $java = Get-Command java -ErrorAction SilentlyContinue
  if ($java) { return $java.Source }

  $candidates = @(
    "C:\Program Files\Microsoft\jdk-17*",
    "C:\Program Files\Eclipse Adoptium\jdk-17*",
    "C:\Program Files\Java\jdk-17*"
  )
  foreach ($pattern in $candidates) {
    $dir = Get-ChildItem $pattern -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
    if ($dir -and (Test-Path "$($dir.FullName)\bin\java.exe")) {
      $env:JAVA_HOME = $dir.FullName
      $env:Path = "$($dir.FullName)\bin;" + $env:Path
      return "$($dir.FullName)\bin\java.exe"
    }
  }

  throw "Java JDK 17 not found. Install: winget install Microsoft.OpenJDK.17 --source winget"
}

function Set-UserEnv {
  param([string]$Name, [string]$Value)

  $existing = [Environment]::GetEnvironmentVariable($Name, "User")
  if ($existing -ne $Value) {
    [Environment]::SetEnvironmentVariable($Name, $Value, "User")
  }
  Set-Item -Path "Env:$Name" -Value $Value
}

function Install-ZipPackage {
  param(
    [string]$Url,
    [string]$Destination
  )

  if (Test-Path $Destination) {
    Write-Host "Already installed: $Destination"
    return
  }

  Write-Host "Downloading $Url..."
  $zip = Join-Path $env:TEMP ([IO.Path]::GetFileName($Url))
  Invoke-WebRequest -Uri $Url -OutFile $zip -UseBasicParsing

  $stage = Join-Path $env:TEMP ("android-stage-" + [Guid]::NewGuid().ToString("n"))
  Expand-Archive -Path $zip -DestinationPath $stage -Force
  Remove-Item $zip -Force

  New-Item -ItemType Directory -Force -Path (Split-Path $Destination -Parent) | Out-Null
  $items = Get-ChildItem $stage
  if ($items.Count -eq 1 -and $items[0].PSIsContainer) {
    Move-Item $items[0].FullName $Destination
  } else {
    Move-Item $stage $Destination
  }

  Remove-Item $stage -Force -ErrorAction SilentlyContinue

  $nested = Join-Path $Destination (Split-Path $Destination -Leaf)
  if ((Test-Path $nested) -and (Test-Path (Join-Path $nested "android.jar"))) {
    Get-ChildItem $nested | Move-Item -Destination $Destination -Force
    Remove-Item $nested -Recurse -Force
  }
}

function Ensure-CommandLineTools {
  param([string]$Root)

  $latestDir = Join-Path $Root "cmdline-tools\latest"
  $sdkmanager = Join-Path $latestDir "bin\sdkmanager.bat"
  if (Test-Path $sdkmanager) { return $sdkmanager }

  $zip = Join-Path $env:TEMP "commandlinetools-win.zip"
  $url = "https://dl.google.com/android/repository/commandlinetools-win-13114758_latest.zip"
  Write-Host "Downloading Android command-line tools..."
  Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing

  $extract = Join-Path $env:TEMP "android-cmdline-tools"
  if (Test-Path $extract) { Remove-Item $extract -Recurse -Force }
  Expand-Archive -Path $zip -DestinationPath $extract -Force
  Remove-Item $zip -Force

  New-Item -ItemType Directory -Force -Path (Split-Path $latestDir -Parent) | Out-Null
  if (Test-Path $latestDir) { Remove-Item $latestDir -Recurse -Force }

  $inner = Get-ChildItem $extract -Directory | Select-Object -First 1
  Move-Item $inner.FullName $latestDir
  Remove-Item $extract -Recurse -Force

  return $sdkmanager
}

Ensure-Java | Out-Null
New-Item -ItemType Directory -Force -Path $SdkRoot | Out-Null

$platformTools = Join-Path $SdkRoot "platform-tools"
$cmdlineBin = Join-Path $SdkRoot "cmdline-tools\latest\bin"
$sdkmanager = Ensure-CommandLineTools -Root $SdkRoot

Set-UserEnv "ANDROID_HOME" $SdkRoot
Set-UserEnv "ANDROID_SDK_ROOT" $SdkRoot
if ($env:JAVA_HOME) { Set-UserEnv "JAVA_HOME" $env:JAVA_HOME }
Set-UserEnv "GRADLE_OPTS" "-Djavax.net.ssl.trustStoreType=Windows-ROOT"

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$pathParts = @(
  "$env:USERPROFILE\flutter\bin",
  $platformTools,
  $cmdlineBin
)
if ($env:JAVA_HOME) { $pathParts += "$env:JAVA_HOME\bin" }
foreach ($part in $pathParts) {
  if ($userPath -notlike "*$part*") {
    $userPath = if ([string]::IsNullOrWhiteSpace($userPath)) { $part } else { "$part;$userPath" }
  }
}
[Environment]::SetEnvironmentVariable("Path", $userPath, "User")
$env:Path = ($pathParts -join ";") + ";" + $env:Path

Install-ZipPackage -Url "https://dl.google.com/android/repository/platform-tools-latest-windows.zip" -Destination $platformTools
Install-ZipPackage -Url "https://dl.google.com/android/repository/build-tools_r$($BuildTools)_windows.zip" -Destination (Join-Path $SdkRoot "build-tools\$BuildTools")

$platformRevision = "02"
Install-ZipPackage -Url "https://dl.google.com/android/repository/platform-$PlatformApi`_r$platformRevision.zip" -Destination (Join-Path $SdkRoot "platforms\android-$PlatformApi")

Write-Host "Accepting Android SDK licenses..."
$env:GRADLE_OPTS = "-Djavax.net.ssl.trustStoreType=Windows-ROOT"
$yes = ("y`n" * 50)
$yes | & $sdkmanager --sdk_root=$SdkRoot --licenses | Out-Null

& "$env:USERPROFILE\flutter\bin\flutter.bat" config --android-sdk $SdkRoot
if ($env:JAVA_HOME) {
  & "$env:USERPROFILE\flutter\bin\flutter.bat" config --jdk-dir $env:JAVA_HOME
}
Write-Host ""
Write-Host "Android SDK ready at $SdkRoot"
Write-Host "GRADLE_OPTS set for Windows antivirus SSL scanning (AVG/Kaspersky compatible)"
Write-Host "Restart the terminal, then run: powershell -ExecutionPolicy Bypass -File scripts\build-apk.ps1"

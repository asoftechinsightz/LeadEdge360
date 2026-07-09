# Building the Android APK (Windows)

This guide explains how to build `app-release.apk` for the Asoftech Business Suite Flutter app on Windows, including the permanent fix for Gradle SSL download failures caused by antivirus HTTPS scanning.

---

## Root cause (Gradle SSL failures)

On many Windows machines with **AVG**, **Kaspersky**, **Bitdefender**, or similar antivirus, HTTPS traffic is intercepted and re-signed with the antivirus vendor's root certificate.

| Component | Trust store | Result |
|-----------|-------------|--------|
| Browser / PowerShell | Windows certificate store | Downloads work |
| Java / Gradle | Java `cacerts` (default) | **PKIX path building failed** |

**Permanent fix (secure, SSL not disabled):** Use Java's `Windows-ROOT` trust store so Gradle trusts the same certificates as Windows:

```
-Djavax.net.ssl.trustStoreType=Windows-ROOT
```

The build scripts set this automatically via `GRADLE_OPTS` and `JAVA_TOOL_OPTIONS`.

---

## Required software

| Tool | Version | Notes |
|------|---------|-------|
| Flutter | **3.29.3** (stable) | `C:\Users\<you>\flutter` |
| **Git for Windows** | **2.x** | Required by Flutter (`git` in PATH) |
| Dart | **3.7.2** (bundled with Flutter) | |
| JDK | **17** (LTS) | Microsoft OpenJDK 17 recommended |
| Android SDK | **API 35**, build-tools **35.0.1** | |
| Gradle Wrapper | **8.10.2** | Auto-downloaded |
| Android Gradle Plugin | **8.7.0** | In `settings.gradle.kts` |
| Kotlin | **1.8.22** | Matches Flutter 3.29 template |

---

## One-time setup

### 1. Install Flutter

```powershell
# Example: clone to user profile
git clone https://github.com/flutter/flutter.git -b stable $env:USERPROFILE\flutter
$env:Path = "$env:USERPROFILE\flutter\bin;" + $env:Path
flutter doctor
```

### 2. Install Git (required)

```powershell
winget install Git.Git
```

Restart your terminal after install. Verify: `git --version`

### 3. Install JDK 17

```powershell
winget install Microsoft.OpenJDK.17
```

### 4. Install Android SDK

From the `mobile` folder:

```powershell
cd mobile
powershell -ExecutionPolicy Bypass -File .\scripts\setup-android-sdk.ps1
```

This script:

- Installs platform-tools, build-tools, and Android 35 platform
- Sets `ANDROID_SDK_ROOT`, `JAVA_HOME`, and `GRADLE_OPTS`
- Configures Flutter: `flutter config --android-sdk` and `--jdk-dir`
- Accepts SDK licenses

**Restart your terminal** after setup.

### 5. Verify environment

```powershell
flutter doctor -v
```

Android toolchain should show a checkmark. Visual Studio is optional (only needed for Windows desktop apps).

---

## Build APK (standard)

```powershell
cd mobile
powershell -ExecutionPolicy Bypass -File .\scripts\build-apk.ps1
```

The script runs in order (stops on first failure):

1. Verify Java, Android SDK, Flutter
2. Test Gradle wrapper download (`gradlew --version`)
3. `flutter doctor` (Android toolchain)
4. `flutter clean`
5. `flutter pub get`
6. `flutter analyze` (errors only; warnings do not fail the build)
7. `flutter test`
8. `flutter build apk --release`

### Options

```powershell
# Skip tests (faster iteration)
.\scripts\build-apk.ps1 -SkipTests

# Skip analyze
.\scripts\build-apk.ps1 -SkipAnalyze

# Install on USB-connected phone (USB debugging on)
.\scripts\build-apk.ps1 -InstallViaUsb

# Persist JAVA_HOME / GRADLE_OPTS to user environment
.\scripts\build-apk.ps1 -PersistEnv
```

### Output

On success:

```
build\app\outputs\flutter-apk\app-release.apk
release\android\app-release.apk   (copy for distribution)
```

Copy **`app-release.apk`** to your phone and tap to install. Do **not** send `.ps1` scripts to the phone.

---

## Environment variables

| Variable | Example | Set by |
|----------|---------|--------|
| `JAVA_HOME` | `C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot` | setup script |
| `ANDROID_SDK_ROOT` | `C:\Users\<you>\AppData\Local\Android\Sdk` | setup script |
| `GRADLE_OPTS` | `-Djavax.net.ssl.trustStoreType=Windows-ROOT` | setup + build scripts |
| `JAVA_TOOL_OPTIONS` | `-Djavax.net.ssl.trustStoreType=Windows-ROOT` | build script (session) |

`android/local.properties` (auto-generated, do not commit secrets):

```properties
flutter.sdk=C:\\Users\\ARNAV\\flutter
sdk.dir=C:\\Users\\ARNAV\\AppData\\Local\\Android\\Sdk
```

---

## Play Store build (AAB)

For Google Play Console (not direct phone install):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-release.ps1
```

Output: `build\app\outputs\bundle\release\app-release.aab`

---

## Troubleshooting

### `Unable to find git in your PATH`

```powershell
winget install Git.Git
# Restart terminal, then:
git --version
.\scripts\build-apk.ps1
```

### `minifyReleaseWithR8` / Missing `com.google.android.play.core` classes

Flutter release builds enable R8 shrinking. If you see missing Play Core class errors, ensure `android/app/proguard-rules.pro` contains:

```
-dontwarn com.google.android.play.core.**
```

and `android/app/build.gradle.kts` includes:

```kotlin
implementation("com.google.android.play:core:1.10.3")
```

Then run `flutter clean` and rebuild.

### `insufficient memory` / paging file too small

Reduce Gradle heap in `android/gradle.properties` (default is `-Xmx2G`). Close other apps and retry.

### `PKIX path building failed` / Gradle cannot download

**Cause:** Antivirus SSL inspection (see root cause above).

**Fix:**

1. Re-run setup: `.\scripts\setup-android-sdk.ps1`
2. Or set manually in PowerShell before building:

   ```powershell
   $env:GRADLE_OPTS = "-Djavax.net.ssl.trustStoreType=Windows-ROOT"
   $env:JAVA_TOOL_OPTIONS = "-Djavax.net.ssl.trustStoreType=Windows-ROOT"
   ```

3. Restart terminal and run `.\scripts\build-apk.ps1` again.

**Alternative:** Add AVG/Kaspersky root certificate to Java truststore (`keytool -importcert`), or disable HTTPS scanning for `services.gradle.org` and `dl.google.com` in your antivirus settings.

### `JAVA_HOME is not set`

```powershell
winget install Microsoft.OpenJDK.17
# Restart terminal, then:
.\scripts\setup-android-sdk.ps1
```

### `Android SDK not found`

```powershell
.\scripts\setup-android-sdk.ps1
flutter doctor --android-licenses
```

### Corrupted Gradle cache

```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\wrapper\dists" -ErrorAction SilentlyContinue
.\scripts\build-apk.ps1
```

### Corrupted Flutter build

```powershell
flutter clean
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
.\scripts\build-apk.ps1
```

### `Cannot find module` (Next.js website, not mobile)

Website only — delete `.next` and restart `npm run dev`. Unrelated to APK builds.

---

## CI/CD (GitHub Actions / Linux)

Linux agents do not need `Windows-ROOT`. Use default Java trust store.

```yaml
- uses: subosito/flutter-action@v2
  with:
    flutter-version: '3.29.3'
    channel: stable
- run: cd mobile && flutter pub get && flutter test && flutter build apk --release
```

Do **not** set `GRADLE_OPTS=Windows-ROOT` on Linux.

---

## Project structure

```
mobile/
├── android/                 # Gradle project
│   ├── gradle.properties    # JVM + Android settings
│   └── gradle/wrapper/      # Gradle 8.10.2 + SHA-256 checksum
├── scripts/
│   ├── build-apk.ps1        # Full validated APK build
│   ├── build-release.ps1    # Play Store AAB
│   ├── setup-android-sdk.ps1
│   └── lib/BuildEnv.ps1     # Shared env + SSL fix
├── BUILD.md                 # This file
└── lib/                     # Flutter app source
```

---

## Version compatibility matrix

| Flutter 3.29.3 | Value |
|----------------|-------|
| Gradle | 8.10.2 |
| AGP | 8.7.0 |
| Kotlin | 1.8.22 |
| compileSdk | 35 (from Flutter) |
| Java | 17 |

These match the official Flutter 3.29 Android template.

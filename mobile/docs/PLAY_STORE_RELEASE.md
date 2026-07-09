# Play Store release — Asoftech Business Suite (Android)

**Package:** `com.asoftechinsightz.asoftech_business_suite`  
**Version:** `1.0.0+1` (from `pubspec.yaml`)

---

## 1. Prerequisites

| Item | Action |
|------|--------|
| Flutter SDK | 3.16+ stable |
| Play Console account | [Google Play Console](https://play.google.com/console) — one-time $25 |
| Signing keystore | Create once, store securely (never commit) |
| Privacy policy | Live at https://asoftechinsightz.com/privacy |
| FCM (optional) | Firebase project + `google-services.json` |

---

## 2. First-time Android setup

```powershell
cd mobile
flutter create . --org com.asoftechinsightz --project-name asoftech_business_suite --platforms=android
powershell -ExecutionPolicy Bypass -File scripts/apply-android-release.ps1
flutter pub get
```

---

## 3. Create upload keystore

```powershell
mkdir mobile\release\keystore -Force
keytool -genkey -v -keystore mobile\release\keystore\upload-keystore.jks `
  -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

Copy `release/android/key.properties.example` → `android/key.properties` and fill passwords.

Add to `android/app/build.gradle` (inside `android {}` block):

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

Add `android/key.properties` to `.gitignore` (already ignored via `*.jks` pattern — verify).

---

## 4. AndroidManifest hardening

In `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />

<application
    android:label="Asoftech Business Suite"
    android:usesCleartextTraffic="false"
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

For FCM, follow Firebase Android setup and add `google-services.json`.

---

## 5. Build release AAB

```powershell
cd mobile
powershell -ExecutionPolicy Bypass -File scripts/build-release.ps1
```

Output: `build/app/outputs/bundle/release/app-release.aab`

---

## 6. Play Console checklist

### Store listing
- [ ] App name: **Asoftech Business Suite**
- [ ] Short description (80 chars): Enterprise CRM + retail for LeadEdge360 & RetailEdge360
- [ ] Full description: dogfooding LeadEdge360, offline leads, AI assistant, retail inventory
- [ ] App icon 512×512 PNG
- [ ] Feature graphic 1024×500
- [ ] Phone screenshots (min 2): Login, Leads list, Lead detail, Retail dashboard

### App content
- [ ] **Privacy policy URL:** https://asoftechinsightz.com/privacy
- [ ] **Data safety:** Account info, business CRM data, device IDs (FCM token if enabled)
- [ ] **Target audience:** Business / 18+
- [ ] **Ads:** No

### Release
- [ ] Upload `app-release.aab` to Internal testing first
- [ ] Test on physical device: login, offline leads, biometric lock, retail inventory
- [ ] Promote to Production when validated

---

## 7. Security features (Phase 7)

| Feature | Implementation |
|---------|----------------|
| JWT in encrypted storage | `flutter_secure_storage` |
| Biometric app lock | Profile → Security → enable; locks on resume + 15 min idle |
| HTTPS only | `network_security_config.xml` |
| Session expiry | Auto logout on refresh failure |
| Logout clears cache | Hive + offline queue cleared |

---

## 8. Internal testing track (recommended)

1. Play Console → **Testing → Internal testing**
2. Add tester emails (your team)
3. Upload AAB, share opt-in link
4. Validate against production API `https://asoftechinsightz.com/api`

---

## Support

- Email: support@asoftechinsightz.com
- Mobile README: `mobile/README.md`

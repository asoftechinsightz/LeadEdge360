# Android Production Release — RC3

**App ID:** `com.asoftechinsightz.asoftech_business_suite`  
**Version:** see `mobile/pubspec.yaml` (`version: 1.0.0+1`)

## Prerequisites

1. Flutter SDK 3.2+ and Android SDK
2. **Kotlin 2.1.0** (configured in `android/settings.gradle.kts` — required by `mobile_scanner` 6.x)
3. Upload keystore (never commit)
4. Firebase project for FCM crash reporting (`firebase_core`, `firebase_messaging` in pubspec)

## Signing setup

Create `mobile/android/key.properties`:

```properties
storePassword=<password>
keyPassword=<password>
keyAlias=upload
storeFile=/path/to/upload-keystore.jks
```

Update `mobile/android/app/build.gradle.kts` release block to use `signingConfigs.create("release")` reading key.properties (production step on build machine).

## Build

```bash
cd mobile
flutter clean
flutter pub get
flutter build apk --release --dart-define=API_BASE_URL=https://app.asoftechinsightz.com/api
```

If you see `kotlin.Suppress was compiled with an incompatible version` (metadata 2.1.0 vs compiler 1.8.x), ensure `android/settings.gradle.kts` uses Kotlin **2.1.0** and run `flutter clean` before rebuilding.

Outputs:

- `dist/android/asoftech-<version>.aab` — Play Store
- `dist/android/asoftech-<version>.apk` — sideload / pilot

## Versioning

Increment in `pubspec.yaml`:

```yaml
version: 1.0.1+2   # name+code
```

## Crash reporting

- Enable Firebase Crashlytics in Firebase console
- Add `google-services.json` to `mobile/android/app/` (not committed — CI secret)
- Verify crash test build on internal track before pilot

## Release notes template

```
LeadEdge360 & RetailEdge360 v1.0.x

- CRM: leads, opportunities, WhatsApp templates
- Retail: POS checkout (cash, UPI, card), barcode scan
- Security: OTP rate limiting, biometric login
- Fixes: [list from sprint]
```

## Play Store checklist

- [ ] Signed AAB uploaded to internal testing
- [ ] Privacy policy URL live
- [ ] Data safety form completed
- [ ] Screenshots (phone + tablet)
- [ ] Target API level meets Play requirements

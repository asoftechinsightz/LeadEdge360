# Asoftech Business Suite — Mobile (Flutter)

Android-first enterprise app for **LeadEdge360** and **RetailEdge360**, integrated with the existing AsoftechInsightz backend.

## Phase 2 status ✅

- Flutter project scaffold (`mobile/`)
- Material 3 dark theme (Suite navy + primary blue)
- Dio client + JWT refresh interceptor
- Secure token storage + Hive cache
- Auth: splash, login, forgot password, logout
- Business Suite shell: product selection, home dashboard (`/mobile/bootstrap`)
- Riverpod + go_router navigation

## Phase 3 status ✅ (LeadEdge360)

- **Leads list** — search, status/label filters, infinite scroll (`/sales/leads`)
- **Lead detail** — overview, timeline, notes, follow-ups, tasks (`/mobile/leads/:id`)
- **Pipeline board** — kanban columns by stage (`/opportunities/pipeline`)
- **Create lead** — FAB + bottom sheet (`POST /leads`)
- **Status updates** — `PATCH /mobile/leads/:id/status`
- **Add note / follow-up / task** from detail screen

## Prerequisites

1. [Flutter SDK](https://docs.flutter.dev/get-started/install) 3.16+ (stable)
2. [Git for Windows](https://git-scm.com/download/win) — **required** (`git` in PATH)
3. Android Studio or Android SDK + JDK 17
3. Backend running at `https://asoftechinsightz.com/api`

## First-time setup

See **[BUILD.md](./BUILD.md)** for full Windows build instructions, Gradle SSL fix, and troubleshooting.

From repo root:

```powershell
cd mobile

# Generate android/ ios/ platform folders (keeps lib/)
flutter create . --org com.asoftechinsightz --project-name asoftech_business_suite --platforms=android

flutter pub get
flutter analyze
flutter test
```

## Run (dev)

```powershell
# Production API (default)
flutter run

# Local backend
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api
```

> Use `10.0.2.2` for Android emulator → host machine localhost.

## Release APK

```powershell
flutter build apk --release --dart-define=API_BASE_URL=https://asoftechinsightz.com/api
# Output: build/app/outputs/flutter-apk/app-release.apk
```

## Project structure

```
mobile/lib/
├── main.dart                 # Entry + Hive init
├── app.dart                  # MaterialApp.router
├── core/
│   ├── config/               # API URL, keys
│   ├── network/              # Dio, auth interceptor
│   ├── storage/              # Secure tokens, Hive
│   ├── sync/                 # Cache, offline queue, sync engine
│   ├── notifications/        # Push (FCM), notifications API
│   ├── theme/                # Colors, Material 3
│   └── router/               # go_router + auth guards
├── features/
│   ├── auth/                 # Login, splash, session
│   ├── leadedge360/          # Leads, pipeline, detail
│   ├── ai/                   # Suggest + score on lead detail
│   ├── retailedge360/        # KPIs, inventory, WebView POS
│   ├── notifications/        # Inbox screen
│   └── shell/                # Products, home dashboard
└── shared/widgets/           # GlassCard, buttons, fields
```

## FCM push (optional)

1. Create a Firebase project and add Android app `com.asoftechinsightz.asoftech_business_suite`
2. Download `google-services.json` → `mobile/android/app/`
3. Run with FCM enabled:

```powershell
flutter run --dart-define=ENABLE_FCM=true --dart-define=API_BASE_URL=https://asoftechinsightz.com/api
```

Without `ENABLE_FCM=true`, push registration is skipped (in-app notifications still work).

## Offline behavior

- Lead list and detail load from Hive cache when offline
- Writes queue locally and replay on reconnect
- Tap the banner on the Leads tab to force sync

## RetailEdge360

Native tabs when you switch product to **RetailEdge360**:

| Tab | Feature |
|-----|---------|
| Home | KPI dashboard + link to web POS |
| Inventory | SKU list, AI shelf-life, add/remove |
| Profile | Account & notifications |

**Full POS:** Home → **Open full POS (Web)** or app bar browser icon → loads `https://asoftechinsightz.com/retailedge360` with your JWT injected.

> Native barcode/POS checkout awaits backend `POST /retail/pos/sale` (see API report).

## Test credentials (production)

Use your VPS admin account, e.g. `admin@asoftechinsightz.com`.

## Phase 4 status ✅ (Offline sync + notifications)

- **Hive lead cache** — list, detail, bootstrap cached locally
- **Delta sync** — `GET /mobile/sync` + `/mobile/sync/changes` every 10 min + on pull-to-refresh
- **Offline write queue** — status, notes, follow-ups, tasks, create lead, pipeline moves
- **Connectivity banner** — offline indicator + tap-to-sync on Leads tab
- **Notifications inbox** — `GET /notifications`, mark read, unread badge on home
- **FCM registration** — `POST /notifications/devices` (opt-in via `--dart-define=ENABLE_FCM=true`)

## Phase 6 status ✅ (RetailEdge360)

- **Retail dashboard** — KPIs from `/retail/kpis`, high-risk SKU preview
- **Inventory** — list, search, add SKU, re-predict, delete (`/retail/inventory`)
- **Web POS fallback** — authenticated WebView at `/retailedge360` (full web module until native POS APIs ship)
- **Stores API** wired in repository for future store picker

## Phase 7 status ✅ (Security + Play Store)

- **Biometric app lock** — resume + 15 min idle (`local_auth`)
- **Security settings** — toggle biometrics, privacy/terms links, app version
- **Session expiry** — auto logout when refresh token fails
- **HTTPS-only Android config** — `network_security_config.xml` + release scripts
- **Play Store guide** — `mobile/docs/PLAY_STORE_RELEASE.md`
- **Release build** — `scripts/build-release.ps1` → `app-release.aab`

## All phases complete 🎉

See `mobile/docs/PLAY_STORE_RELEASE.md` to publish v1.0.

## CI (GitHub Actions sketch)

```yaml
- run: cd mobile && flutter pub get
- run: cd mobile && flutter analyze
- run: cd mobile && flutter test
- run: cd mobile && flutter build apk --release
```

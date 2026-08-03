# LeadEdge360 Mobile — Developer Handover Guide

**Version:** 1.0  
**Audience:** Mobile engineering team starting LeadEdge360 Mobile v2  
**Prerequisite:** Product Owner approval of documentation package  

---

## 1. Repository setup (new mobile repo)

Mobile app is **not** in the LeadEdge360 v1.0 monolith. Create a dedicated repo:

```text
leadedge360-mobile/
├── app/                    # Expo Router screens (or src/screens)
├── components/             # UI primitives
├── features/               # Feature modules
├── services/               # API, auth, sync
├── store/                  # Zustand stores
├── navigation/             # React Navigation config
├── theme/                  # Tokens from MOBILE_UX_GUIDELINES
├── assets/                 # Icons, fonts, splash
├── __tests__/
├── e2e/
├── app.config.ts           # Expo config
├── eas.json                # EAS Build profiles
└── package.json
```

**Do not** modify `asoftech-insightz` web repo for mobile app code.

---

## 2. Architecture summary

- **Framework:** React Native + Expo (recommended in [MOBILE_ARCHITECTURE.md](./MOBILE_ARCHITECTURE.md))
- **State:** TanStack Query + Zustand
- **Navigation:** React Navigation (bottom tabs + stacks)
- **API:** Axios + interceptors (see `docs/MOBILE_API_GUIDE.md`)
- **Offline:** SQLite + sync queue ([MOBILE_OFFLINE_STRATEGY.md](./MOBILE_OFFLINE_STRATEGY.md))

---

## 3. Folder structure (feature-first)

```text
features/
  auth/
    screens/
    hooks/
    api/
  dashboard/
  leads/
  followups/
  whatsapp/
  notifications/
  admin/
  settings/

services/
  api-client.ts       # axios instance
  auth-service.ts     # login, refresh, logout
  sync-engine.ts      # offline queue processor
  secure-storage.ts   # token wrapper

components/
  ui/                 # Button, Card, Badge, Input
  lead/               # LeadRow, ScoreBadge, StatusChip
  layout/             # Screen, Header, TabBar
```

---

## 4. Coding standards

| Rule | Standard |
|------|----------|
| Language | TypeScript strict |
| Lint | ESLint + `@react-native` config |
| Format | Prettier |
| Imports | Absolute `@/` paths |
| API calls | Only via `services/` — no raw fetch in screens |
| Side effects | React Query for server state |
| Secrets | Never commit; use EAS secrets |

### Error handling

```typescript
// Always map API errors via code
if (error.response?.data?.code === 'AUTH_TOKEN_EXPIRED') {
  await authService.refresh()
}
```

Reference: [`../error-codes.md`](../error-codes.md)

---

## 5. Naming standards

| Entity | Convention | Example |
|--------|------------|---------|
| Screens | PascalCase + Screen | `LeadListScreen` |
| Hooks | use + camelCase | `useLeads` |
| API modules | camelCase | `leadsApi.list()` |
| SQLite tables | snake_case | `leads_cache` |
| Deep links | lowercase | `leadedge360://lead/{id}` |
| Test IDs | kebab-case | `lead-row-{id}` |

### Lead field names (match API)

Use API JSON keys: `assignedTo`, `territory`, `label`, `score`, `reasons`, `engine`, `budget`, `whatsapp`.

---

## 6. Reusable components

| Component | Props | Notes |
|-----------|-------|-------|
| `ScoreBadge` | `score`, `label` | Hot/Warm/Cold colors |
| `StatusChip` | `status` | Six pipeline statuses |
| `LeadRow` | `lead`, `onPress` | List default |
| `KpiGrid` | `kpis` | Dashboard |
| `FollowUpRow` | `followup` | Due/overdue styling |
| `OfflineBanner` | — | NetInfo driven |
| `SyncStatusIcon` | `status` | pending/synced/failed |
| `EmptyState` | `title`, `cta` | |
| `Screen` | `children` | Safe area + padding |

Build on tokens in [MOBILE_UX_GUIDELINES.md](./MOBILE_UX_GUIDELINES.md).

---

## 7. Theme

```typescript
export const theme = {
  colors: {
    background: '#0B1220',
    card: '#111827',
    primary: '#FF8A3D',
    accent: '#22C55E',
    muted: '#94A3B8',
    border: '#1E293B',
  },
  radius: 14,
  spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
}
```

**Fonts:**

- Display: Space Grotesk (load via expo-google-fonts or bundled)
- Body: Inter

---

## 8. Icons

- **Library:** Lucide React Native (matches web lucide-react icons)
- Tab icons: Home, Target (Leads), CheckSquare (Tasks), MessageCircle, Menu

---

## 9. Environment variables

```env
EXPO_PUBLIC_API_URL=https://app.asoftechinsightz.com/api
EXPO_PUBLIC_APP_ENV=production
```

Staging builds use EAS profile `staging` with different URL.

---

## 10. CI/CD

### GitHub Actions (example)

```yaml
# .github/workflows/mobile-ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage
```

### EAS Build profiles (`eas.json`)

| Profile | Use |
|---------|-----|
| `development` | Dev client |
| `preview` | Internal APK/IPA |
| `production` | Store release |

```bash
eas build --platform all --profile production
eas submit --platform ios
eas submit --platform android
```

---

## 11. Build pipeline checklist

1. `npm run lint` + `npm test`
2. EAS build iOS + Android
3. Smoke on staging API (auth + lead create)
4. Upload to TestFlight / Play internal
5. Tag release `mobile-v1.0.0`
6. Update store metadata

---

## 12. App Store submission

| Item | Value |
|------|-------|
| App name | LeadEdge360 |
| Subtitle | AI Lead Intelligence for Field Sales |
| Category | Business |
| Privacy | Link `https://app.asoftechinsightz.com/privacy` |
| DPDP | Declare contact info, identifiers, usage data |
| Screenshots | Dashboard, Leads, Lead detail, Tasks (from staging) |
| Demo account | Provide staging credentials for review |

**Entitlements:** Push notifications, optional Face ID usage string.

---

## 13. Play Store submission

| Item | Value |
|------|-------|
| Package | `com.asoftechinsightz.leadedge360` (confirm with PO) |
| Data safety | Email, phone, device ID — synced with privacy policy |
| Target API | Latest Play requirement |
| Signing | Play App Signing via EAS |

---

## 14. API integration checklist

- [ ] Import OpenAPI: `docs/openapi.json` from backend repo tag
- [ ] Configure Postman environment for staging
- [ ] Implement refresh interceptor
- [ ] Register push device on login
- [ ] Map all screens per [MOBILE_API_MAPPING.md](./MOBILE_API_MAPPING.md)
- [ ] Never call undocumented endpoints

---

## 15. First sprint tasks (post-approval)

1. Scaffold Expo app + navigation shell
2. Auth flow end-to-end against staging
3. Lead list + detail read-only
4. SecureStore + refresh rotation
5. Detox smoke: login → list leads

---

## 16. Web cookie bridge (E-002)

When `WEB_JWT_BRIDGE=true`, the web app can call mobile API roots (`followups`, `dashboard`, `whatsapp`, `notifications`, `admin`, `users`) using the **cookie session** instead of JWT. Mobile apps must continue using JWT — no change to mobile auth.

- Guide: [MOBILE_API_GUIDE.md](./MOBILE_API_GUIDE.md)  
- Flow: [auth-flow.md](./auth-flow.md)  
- Tests: `npm run test:bridge`

---

## 17. Documentation index

| Doc | Purpose |
|-----|---------|
| [README.md](./README.md) | Index + references |
| [MOBILE_PRD.md](./MOBILE_PRD.md) | Requirements |
| [MOBILE_ARCHITECTURE.md](./MOBILE_ARCHITECTURE.md) | IA + tech stack |
| [MOBILE_SCREEN_BLUEPRINTS.md](./MOBILE_SCREEN_BLUEPRINTS.md) | Screen specs |
| [MOBILE_UX_GUIDELINES.md](./MOBILE_UX_GUIDELINES.md) | Visual UX |
| [MOBILE_API_MAPPING.md](./MOBILE_API_MAPPING.md) | API matrix |
| [MOBILE_API_GUIDE.md](./MOBILE_API_GUIDE.md) | Bridge + API notes |
| [auth-flow.md](./auth-flow.md) | JWT vs cookie diagrams |
| [MOBILE_OFFLINE_STRATEGY.md](./MOBILE_OFFLINE_STRATEGY.md) | Offline |
| [MOBILE_SECURITY.md](./MOBILE_SECURITY.md) | Security |
| [MOBILE_NOTIFICATION_FRAMEWORK.md](./MOBILE_NOTIFICATION_FRAMEWORK.md) | Notifications |
| [MOBILE_TEST_STRATEGY.md](./MOBILE_TEST_STRATEGY.md) | QA |
| [MOBILE_RELEASE_ROADMAP.md](./MOBILE_RELEASE_ROADMAP.md) | Phases |

---

## 18. Support contacts

- Product: enquiry@asoftechinsightz.com
- API spec: `docs/openapi.json` in asoftech-insightz repo

---

**STOP:** Do not begin mobile implementation until Product Owner signs off this documentation package.

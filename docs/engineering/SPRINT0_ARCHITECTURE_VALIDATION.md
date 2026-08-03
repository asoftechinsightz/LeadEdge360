# Sprint 0 — Architecture Validation

**Date:** 3 August 2026  
**Method:** Read-only trace of routing, auth, data, and integration flows  
**Constraint:** No architecture changes — documentation only  

**Architecture health score:** **78 / 100** — clear monolith boundaries; known cookie/JWT split is primary structural debt.

---

## 1. Route architecture

### 1.1 Next.js App Router

| Group | Routes | Shell |
|-------|--------|-------|
| Marketing | `/`, `/about`, `/products`, `/pricing`, `/solutions`, `/contact`, `/blog` | `SiteShell` |
| Application | `/dashboard`, `/leadedge360`, `/retailedge360`, `/billing`, `/billing/success` | `AppShell` |
| Auth / legal | `/signin`, `/download`, `/privacy`, `/terms` | Mixed |
| Legacy | `/app/*` | Redirects via `next.config.js` → real routes |

### 1.2 API surface

**Single catch-all:** `app/api/[[...path]]/route.js`

| Export | Role |
|--------|------|
| `GET/POST/PATCH/PUT/DELETE` | Delegates to `route(method, segs, request)` |
| `OPTIONS` | CORS preflight |

**Dispatch order inside `route()`:**

1. Public health — `GET /api` → `{ ok, name, time }`
2. `auth` — Emergent cookie flows + fallthrough to `mobileRoute` for JWT auth registration
3. `resolveTenant(request)` — cookie session → `orgId`
4. Demo seed (only `DEMO_ORG_ID`)
5. **`mobileRoute()`** — JWT paths; returns null if no match
6. Web cookie handlers — `agents`, `leads`, `kpis`, `products`, `retail-kpis`, `billing`, `webhooks`, `contact`, `seed-reset`

**Finding:** Mobile API is **first-class inside same handler** — not a separate server. Extension for E-002 should bridge cookie context into shared functions extracted from `mobile-routes.js`.

---

## 2. Authentication flows

### 2.1 Cookie flow (web)

```
/signin → GET /api/auth/login → Emergent hosted login
       → GET /api/auth/callback?session_id=
       → exchangeSessionId() → cookie emergent_session
       → ensureUserOrg() → redirect /dashboard
GET /api/auth/me → resolveTenant() → user + billing context
POST /api/auth/logout → delete cookie
POST /api/auth/dpdp-consent → consent_log + users.dpdpConsent
```

| Component | Path |
|-----------|------|
| OAuth config | `lib/auth.js` — `EMERGENT_PROJECT_ID`, `EMERGENT_API_KEY` |
| Tenant resolution | `lib/tenant.js` — cookie + optional demo |
| Session cookie | `emergent_session`, 7d, httpOnly, secure in production |

### 2.2 JWT flow (mobile)

```
POST /api/auth/register → OTP → verify-otp
POST /api/auth/login-password
POST /api/auth/refresh-token
Authorization: Bearer <access> on followups, dashboard, whatsapp, notifications, admin, users
```

| Component | Path |
|-----------|------|
| Tokens | `lib/jwt.js` — access + refresh in `auth_refresh_tokens` |
| Password | `lib/password.js`, `lib/otp.js` |
| User context | `verifyAccessToken` in `mobile-routes.js` handlers |

### 2.3 Auth gap (Sprint 1 target E-002)

| Capability | Cookie web | JWT mobile |
|------------|------------|------------|
| Follow-ups | ❌ | ✅ |
| Admin users | ❌ | ✅ |
| WA send/inbox | ❌ | ✅ |
| Notifications | ❌ | ✅ |
| Dashboard revenue | ❌ | ✅ |
| Profile PATCH | ❌ | ✅ `users/me` |

**No redesign:** Bridge cookie `orgId`/`userId` into same handler functions.

---

## 3. MongoDB collections (runtime)

| Collection | Primary writers | Tenant key |
|------------|-----------------|------------|
| `leads` | `route.js`, webhooks | `orgId` |
| `products` | `route.js` | `orgId` |
| `lead_activities` | `route.js` status changes | via lead |
| `users` | `tenant.js`, mobile auth, billing | email + `orgId` |
| `orgs` | `tenant.js`, billing activate | `id` |
| `payments` | billing checkout/verify | `orgId` |
| `subscriptions` | `activate-payment.js` | `orgId` |
| `audit_logs` | `billing/audit.js` | `orgId` |
| `consent_log` | dpdp consent | email |
| `contact_requests` | contact API | — |
| `follow_ups` | `mobile-routes.js` | `orgId` |
| `auth_otps` | `otp.js` | — |
| `auth_refresh_tokens` | `jwt.js` | userId |
| `whatsapp_messages` | mobile WA handlers | `orgId` |
| `notifications` | mobile (read; insert path weak) | `orgId` |
| `push_devices` | mobile | userId |

**Connection:** `lib/mongo.js` — singleton `MongoClient` at module init (**build-time sensitivity** if `MONGO_URL` unset).

---

## 4. Billing flow

```
/pricing UI → POST /api/billing/checkout → Razorpay order
           → client verify → POST /api/billing/verify
           → activatePaymentSuccess() → orgs plan + entitlements
           → subscriptions + payments records
Webhook: POST /api/webhooks/razorpay → signature verify → activate
GET /api/billing/status, GET /api/auth/me billing slice
```

| Module | Role |
|--------|------|
| `lib/razorpay.js` | PLANS, order create, signatures |
| `lib/billing/activate-payment.js` | Org patch + subscription doc |
| `lib/billing/plan-entitlements.js` | Limits defined — **not enforced on create** (E-004) |
| `lib/billing/org-billing.js` | Context for `auth/me` |

**Gap:** Recurring subs not implemented (E-005). `subscriptions` collection write exists but OpenAPI notes read-heavy usage.

---

## 5. AEO flow

```
AeoGrowthEngine.jsx (client)
  → loadAeoProfile() from sessionStorage (lib/aeo/profile.js)
  → computeAeoMetrics(profile, kpis) client-side
  → lib/aeo/recommendations.js rules
  → invokeAeoPrompt via lib/aeo/actions.js → runAeoPrompt in scoring.js
Config: config/aeo/* (13 files)
```

**Server persistence:** ❌ — E-003 target `users.preferences.aeoProfile`

**n8n:** 3 AEO reminder workflows assume profile completeness — currently client-only.

---

## 6. AI scoring flow

```
POST /api/leads → aiScore(lead) in lib/scoring.js
  → EMERGENT_LLM_KEY set? → Emergent OpenAI proxy gpt-4o-mini
  → else ruleScore() hybrid fallback
POST /api/leads/:id/rescore → same
Retail: POST /api/products → predictShelfLife() in retail-ai.js
```

**Single gateway:** `https://integrations.emergentagent.com/llm/openai/v1/chat/completions`

**Rate limit config:** `config/aeo/defaults.json` `llmCallsPerHour` — used in AEO UI path.

---

## 7. Dashboard architecture

| Page | Data sources | Components |
|------|--------------|------------|
| `/dashboard` | `GET /api/kpis`, retail KPIs, embedded AEO | `KpiCard`, `AeoGrowthEngine`, product cards |
| `/leadedge360` | `GET /api/leads`, `GET /api/kpis` | Charts (Recharts direct), `KpiCard`, `AeoGrowthEngine` strip |
| `/retailedge360` | `GET /api/products`, `GET /api/retail-kpis` | Inline `Kpi`, Recharts |

**Pattern:** Client-side `fetch('/api/...')` with cookie — no TanStack Query (provider not mounted).

**Executive metrics:** `/api/metrics` (platform ops) — separate from tenant KPIs.

---

## 8. Mobile route mapping

`lib/mobile-routes.js` — `mobileRoute()` roots:

| Root | Handler | Auth |
|------|---------|------|
| `auth` | register, OTP, login-password, refresh, logout | Public / token |
| `users` | me, PATCH, change-password, subscription | JWT |
| `followups` | CRUD, reminders, close | JWT |
| `dashboard` | kpis, followups-due, revenue, sales-performance | JWT |
| `whatsapp` | send, send-template, conversation/:leadId | JWT |
| `notifications` | list, read, devices, settings | JWT |
| `admin` | users, roles, subscriptions, product-access | JWT admin |

**Also in `route.js` (cookie):** `GET /api/leads/sources` implemented; mobile admin partial.

**OpenAPI drift:** POST admin/roles, POST admin/subscriptions, POST leads/sources — documented only.

---

## 9. Webhook architecture

| Endpoint | Token | Creates |
|----------|-------|---------|
| `POST /api/webhooks/whatsapp` | `X-Webhook-Token` / `N8N_WEBHOOK_TOKEN` | Lead via ingest |
| `POST /api/webhooks/facebook` | Same | Lead |
| `POST /api/webhooks/google` | Same | Lead |
| `POST /api/webhooks/razorpay` | Razorpay signature | Billing activate |

**n8n:** External orchestrator posts to app with shared token; app does not call n8n from code.

---

## 10. Architecture risks (document only)

| Risk | Severity | Epic |
|------|----------|------|
| Cookie vs JWT feature split | High | E-002 |
| `mongo.js` module-level connect | Medium | Build/env |
| Monolith `route.js` size (~700 lines) | Medium | Extract handlers when extending |
| Hardcoded `AGENTS` vs `users` | Medium | E-007, E-030 |
| Permissive security headers | Medium | Security hardening backlog |
| Demo seed on `DEMO_ORG_ID` only | Low | By design |

---

## 11. Extension points (for Sprint 1+ — no change now)

| Extension | Location |
|-----------|----------|
| Cookie bridge | `route.js` after `resolveTenant` |
| Profile PATCH | `auth/me` + `users` collection |
| Plan enforcement | `POST leads`, admin user create, `POST products` |
| Shared handler module | Extract from `mobile-routes.js` → `lib/handlers/` (optional, same logic) |

**STOP** — Architecture documented. No modifications.

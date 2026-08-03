# API Security Review

**Router:** `app/api/[[...path]]/route.js` (monolith) + `lib/mobile-routes.js`

---

## Route inventory (summary)

| Root | Auth required | orgId scoped | Notes |
|------|---------------|--------------|-------|
| `/api/` (health) | No | No | Public OK |
| `/api/auth/*` | Mixed | Partial | Login public; me uses tenant |
| `/api/leads` | Tenant resolve | Yes | Demo org if anonymous |
| `/api/products` | Tenant resolve | Yes | Entitlement when flag ON |
| `/api/kpis`, `/api/retail-kpis` | Tenant resolve | Yes | |
| `/api/billing/*` | Signed-in user | Yes | Simulate if test mode |
| `/api/webhooks/*` | Token/signature | Partial | See H-03, C-02 |
| `/api/contact` | Tenant resolve | Stores orgId | Mass assignment M-06 |
| `/api/agents` | No | N/A | Static list |
| `/api/seed-reset` | **No** | Demo only | M-05 |
| Mobile roots | JWT or bridge | Yes | followups, admin, wa, users/me |

---

## Input validation

| Area | Status | Evidence |
|------|--------|----------|
| Lead create | Pass | Requires name+phone |
| Lead status | Pass | `STATUSES` allowlist |
| Lead search regex | Pass | Escaped in `route.js` 276 |
| Billing plan | Pass | `PLANS.find` |
| AEO preferences | Pass | `preferences-merge.js` URL validation |
| Contact | Weak | email+message only; rest of body stored |
| Webhook ingest | Weak | phone required; orgId trusted |

---

## Authorization

| Check | Status |
|-------|--------|
| Billing checkout demo blocked | Pass — 401 if `isDemo` |
| Billing verify org match | Pass |
| Entitlement 402/403 | Pass when flag ON |
| Bridge 404 when OFF | Pass |

---

## Rate limiting

| Layer | Status |
|-------|--------|
| Application | **None** |
| nginx (documented) | Partial `/api/auth/` only |
| Recommendation | Add limits on auth, webhooks, contact |

---

## Mass assignment / prototype pollution

| Endpoint | Risk |
|----------|------|
| DPDP consent POST | `...body` spread — M-03 |
| Contact POST | `...body` spread — M-06 |
| Lead PATCH | Limited fields — OK |
| users/me PATCH | Merged preferences with validation — OK |
| Admin user PATCH | Allowlist keys — OK |

---

## Webhook security

| Webhook | Validation |
|---------|------------|
| Razorpay | HMAC `verifyWebhookSignature` — requires secret |
| WhatsApp/FB/Google | `x-webhook-token` — bypass if default (C-02) |

---

## File upload

No generic file upload API found in router. Images via Next.js static/public only.

---

## Path traversal

Dynamic segments use route params as IDs (UUID strings), not filesystem paths — low risk.

---

## HTTP status usage

Consistent 401/403/402/404/400 patterns; entitlement errors use structured `code` fields.

---

## OPTIONS / CORS

`OPTIONS` returns 204 with `Access-Control-Allow-Origin: *` — see H-01.

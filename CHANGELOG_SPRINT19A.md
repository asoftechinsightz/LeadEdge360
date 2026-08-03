# Sprint 19A MVP — Changelog

Subscription foundation critical path. Each section is a **rollback point** (revert listed files to undo).

---

## Rollback index

| Task | Rollback: remove / revert |
|------|---------------------------|
| 1 | `lib/billing/plan-entitlements.js`, `lib/billing/audit.js` |
| 2 | `lib/billing/activate-payment.js` |
| 3 | `app/api/[[...path]]/route.js` (checkout block) |
| 4 | `app/api/[[...path]]/route.js` (verify block) |
| 5 | `app/api/[[...path]]/route.js` (webhook block) |
| 6 | `app/api/[[...path]]/route.js` (`billing/status`) |
| 7 | `app/billing/success/page.js`, `app/pricing/page.js` |

**Full rollback:** Revert all files above + remove `import { activatePaymentSuccess }` from `route.js`.

---

## Task 1 — Billing foundation modules ✅

**Commit message:** `feat(billing): add plan entitlements and audit log helper`

**Files added:**
- `lib/billing/plan-entitlements.js` — plan → `leadEnabled`, `retailEnabled`, `limits`
- `lib/billing/audit.js` — `writeAuditLog()` → `audit_logs` collection

**Rollback:** Delete both files. No runtime references yet.

---

## Task 2 — `activatePaymentSuccess()` ✅

**Commit message:** `feat(billing): add idempotent activatePaymentSuccess orchestrator`

**Files added:**
- `lib/billing/activate-payment.js`

**Behavior:**
- Loads `payments` by `razorpay_order_id`
- Idempotent when `paid` + `subscriptionId` present
- Cancels prior active subscriptions, inserts new `active` row (30-day period)
- Updates `payments`, `orgs` (plan + entitlements), purchaser `users`
- Writes `audit_logs` (`subscription.activated`)

**Rollback:** Delete `lib/billing/activate-payment.js`. Tasks 4–5 will fail until reverted too.

---

## Task 3 — Checkout auth guard ✅

**Commit message:** `feat(billing): require auth on checkout and persist userId`

**Files modified:**
- `app/api/[[...path]]/route.js` — `POST /api/billing/checkout`

**Changes:**
- Returns `401` when unsigned or demo session
- Stores `userId` on `payments` document
- Returns `paymentId` in response

**Rollback:** Restore checkout block to pre-auth version (remove `tenant.user` check and `userId` field).

---

## Task 4 — Verify endpoint integration ✅

**Commit message:** `feat(billing): wire verify to activatePaymentSuccess`

**Files modified:**
- `app/api/[[...path]]/route.js` — `POST /api/billing/verify`

**Changes:**
- Auth required (`401` if demo/unsigned)
- Org mismatch guard (`403` if `payment.orgId !== session orgId`)
- Calls `activatePaymentSuccess({ source: 'verify' })`
- Returns `redirectUrl`, `subscription`, `org.entitlements`

**Rollback:** Restore inline `payments` + `orgs` updates (pre-19A behavior).

---

## Task 5 — Webhook activation integration ✅

**Commit message:** `feat(billing): webhook triggers full payment activation`

**Files modified:**
- `app/api/[[...path]]/route.js` — `POST /api/webhooks/razorpay`

**Changes:**
- `order.paid` / `payment.captured` call `activatePaymentSuccess({ source: 'webhook' })`
- Errors logged; still returns `200` on valid signature (Razorpay retry-safe)

**Rollback:** Restore payments-only `updateOne` in webhook handler.

---

## Task 6 — Billing status API ✅

**Commit message:** `feat(billing): add GET /api/billing/status for success page`

**Files modified:**
- `app/api/[[...path]]/route.js` — `GET /api/billing/status`

**Response:** `plan`, `billingStatus`, `entitlements`, active `subscription`

**Rollback:** Remove `billing/status` handler block.

---

## Task 7 — Billing success page ✅

**Commit message:** `feat(ui): add /billing/success and update pricing redirect`

**Files added:**
- `app/billing/success/page.js`

**Files modified:**
- `app/pricing/page.js` — redirect to `/billing/success` after verify

**UX:**
- Shows plan name, period end, enabled products
- CTA → `/leadedge360` (+ RetailEdge360 when entitled)

**Rollback:** Delete success page; restore pricing redirect to `/leadedge360`.

---

## MVP complete ✅

Post-MVP wiring for **live E2E test path**:

- `GET /api/auth/me` returns `billing` (plan, activated, entitlements)
- `POST /api/billing/simulate` when `BILLING_TEST_MODE=true`
- `npm run test:billing` — CLI smoke test against Mongo
- LeadEdge360 shows "Subscribed" banner when `billing.activated`

### Run the milestone flow (local)

1. Copy `.env.example` → `.env`, set `MONGO_URL`, `BILLING_TEST_MODE=true`
2. `yarn dev`
3. Sign in → `/pricing` → **Test activate** (Starter)
4. Confirm `/billing/success` → **Go to dashboard**
5. LeadEdge360 shows active plan banner
6. Mongo: `subscriptions`, `orgs.plan`, `audit_logs` populated

### Production flow

1. Set Razorpay keys + `RAZORPAY_WEBHOOK_SECRET`
2. Sign in → `/pricing` → Razorpay checkout → verify → success → dashboard

---

## Suggested commit sequence (local git)

```bash
git add lib/billing/plan-entitlements.js lib/billing/audit.js CHANGELOG_SPRINT19A.md
git commit -m "feat(billing): add plan entitlements and audit log helper"

git add lib/billing/activate-payment.js CHANGELOG_SPRINT19A.md
git commit -m "feat(billing): add idempotent activatePaymentSuccess orchestrator"

# checkout only
git add -p app/api/[[...path]]/route.js CHANGELOG_SPRINT19A.md
git commit -m "feat(billing): require auth on checkout and persist userId"

# verify only (or commit route.js tasks 3-6 together after review)
git commit -m "feat(billing): wire verify to activatePaymentSuccess"
git commit -m "feat(billing): webhook triggers full payment activation"
git commit -m "feat(billing): add GET /api/billing/status"

git add app/billing/success/page.js app/pricing/page.js CHANGELOG_SPRINT19A.md
git commit -m "feat(ui): add billing success page and pricing redirect"
```

---

## Out of scope (19A MVP)

- Recurring Razorpay Subscriptions API  
- `/billing` settings center, payment history, invoice analytics  
- API route entitlement guards, dashboard paywall banners  
- Mongo index scripts, backfill, feature flags  
- Navbar plan badge, `GET /api/billing/payments`  

---

## Post-deploy checks

- [ ] Razorpay test checkout → verify → `/billing/success`  
- [ ] Mongo: `subscriptions`, `audit_logs` populated  
- [ ] Webhook-only path activates org when verify skipped  
- [ ] `RAZORPAY_WEBHOOK_SECRET` set in production  

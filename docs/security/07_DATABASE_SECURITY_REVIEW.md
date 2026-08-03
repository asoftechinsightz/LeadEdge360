# Database Security Review (MongoDB)

---

## Query patterns

| Collection | orgId filter | Notes |
|------------|--------------|-------|
| leads | Yes | CRUD uses `{ id, orgId }` |
| products | Yes | |
| follow_ups | Yes (mobile + legacy) | |
| users | Mixed | Admin scoped; some lookups by email/id only |
| payments | Via order lookup | orgId on payment record |
| audit_logs | Written with orgId | |
| contact_requests | Uses tenant orgId | |
| auth_refresh_tokens | userId only | OK — token bound to user |
| auth_otps | destination | OK |

---

## Cross-tenant leakage risks

| Issue | Severity | Location |
|-------|----------|----------|
| Lead assign `userId` without orgId | High | `route.js` 370 |
| Webhook `body.orgId` | High | `route.js` 667 |
| Admin user create email global | Medium | Unique email across all tenants — intentional? |

---

## NoSQL injection

| Vector | Assessment |
|--------|------------|
| User-controlled query objects | Most filters built server-side |
| Search regex | Escaped before `RegExp` |
| `$where` / `$function` | Not used |
| Raw operator injection in body | Limited — no direct `find(body)` |

**Overall:** Low NoSQL injection risk on reviewed paths.

---

## Aggregation pipelines

No complex user-controlled aggregation pipelines in application code. KPIs computed in application memory from org-filtered finds.

---

## ObjectId validation

Application uses string UUID `id` fields, not Mongo ObjectIds, for primary entities — consistent pattern.

---

## Schema validation

MongoDB schema validation not enabled at database level. Application enforces shape per handler.

---

## Indexes

Not defined in application repo — **operational gap**. Recommend indexes on:
- `leads: { orgId, createdAt }`
- `users: { email }`, `{ orgId }`
- `payments: { razorpay_order_id }`
- `auth_refresh_tokens: { tokenHash }`

---

## Backup & credentials

| Item | Status |
|------|--------|
| Mongo auth in compose | Not enabled (M-09) |
| Network exposure | Internal docker network only |
| Connection string | Env `MONGO_URL` |

---

## Unsafe operators

No use of `$regex` with raw user input without escape (leads search escapes). No `$gt` injection via type confusion observed.

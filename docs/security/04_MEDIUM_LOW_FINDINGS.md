# Medium & Low Findings

## Medium

| ID | Finding | Files | Evidence | Risk | Recommendation |
|----|---------|-------|----------|------|----------------|
| M-01 | No application rate limiting | `app/api/**` | Only nginx partial `/api/auth/` in docs | Brute force OTP/password, webhook flood | Enable nginx limits on `/api/`; app-level limiter for auth |
| M-02 | OTP logged to console (dev) | `lib/otp.js` | `console.log` with OTP code when MSG91 unset | Log aggregation may capture OTP | Disable in prod; never log OTP |
| M-03 | DPDP consent mass assignment | `route.js` ~190–197 | `...body` merged into consent record | Extra fields stored; policy confusion | Allowlist consent fields |
| M-04 | LLM prompt injection | `lib/scoring.js`, `lib/aeo/*` | User lead fields in prompt via `JSON.stringify(lead)` | Model manipulation, data exfil via prompts | Sanitize/limit fields; output schema validation |
| M-05 | `POST /api/seed-reset` unauthenticated | `route.js` 707–714 | Reseeds `DEMO_ORG_ID` without auth | Demo data wipe/abuse | Remove or protect in production |
| M-06 | Contact form stores arbitrary body | `route.js` 698–704 | `...body` inserted to Mongo | Storage abuse, large payloads | Field allowlist |
| M-07 | Razorpay webhook silent failure | `route.js` 655–657 | `console.error` only; returns `{ok:true}` | Paid events not activated; billing inconsistency | Alert on activation failure; return 500 to retry |
| M-08 | No `RAZORPAY_WEBHOOK_SECRET` → verify false | `lib/razorpay.js` 29–30 | `verifyWebhookSignature` returns false if unset | Webhook rejected (OK) but easy misconfig | Document required secret; health check |
| M-09 | Mongo no auth in compose | `docker-compose.yml` | `mongo:7` without `--auth` | Lateral movement if app compromised | Enable Mongo auth + network isolation |
| M-10 | Session cookie `secure` only in production | `route.js` 155 | `secure: NODE_ENV === 'production'` | Cookie theft on mixed content if mis-set NODE_ENV | Force secure + HTTPS only |
| M-11 | Admin role string check only | `mobile-routes.js` 523 | `['admin','superadmin'].includes(role)` | Role escalation if user.role tampered in DB | DB role integrity + audit |
| M-12 | GitHub deploy merges only public URLs | `deploy.yml` | Secrets overwrite partial `.env` | Other secrets depend on manual VPS hygiene | Secret audit on VPS |

## Low

| ID | Finding | Files | Risk | Recommendation |
|----|---------|-------|------|----------------|
| L-01 | Health endpoint public | `route.js` 132 | Reconnaissance | Acceptable; avoid sensitive data in response |
| L-02 | `GET /api/agents` public | `route.js` 243 | Static agent list leak | Low; document as public |
| L-03 | JWT access TTL 900s default | `lib/jwt.js` | Stolen token window | Tune TTL; short access + refresh |
| L-04 | No explicit CSRF tokens | Cookie POST routes | SameSite=lax mitigates partially | Consider CSRF for cookie mutations |
| L-05 | `dangerouslySetInnerHTML` in chart | `components/ui/chart.jsx` | XSS if chart data tainted | Ensure data is numeric/controlled |
| L-06 | Download page example key pattern | `app/download/page.js` | Social engineering | Example only; not a live secret |
| L-07 | n8n `WEBHOOK_URL=localhost` | `docker-compose.yml` | Broken external webhooks | Set public URL in prod |

## Informational

| ID | Note |
|----|------|
| I-01 | No hardcoded production API keys found in `lib/` or `app/` source |
| I-02 | `.env.example` documents secrets without values (good) |
| I-03 | Password hashes excluded from API projections in several queries |
| I-04 | Refresh tokens hashed SHA-256 before storage |
| I-05 | Lead search regex escapes special characters |
| I-06 | Payment activation idempotent on `razorpay_order_id` |

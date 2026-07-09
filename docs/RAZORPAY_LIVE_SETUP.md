# Razorpay Live Keys — Setup Guide

LeadEdge360 supports **two** Razorpay configuration modes:

| Mode | Use case | Where configured |
|------|----------|------------------|
| **Tenant integration** | Each customer uses their own Razorpay account | Settings → Integrations → Razorpay |
| **Platform env** | AsoftechInsightz collects subscription payments globally | VPS `.env` |

## Option A — Per-tenant (recommended for pilots)

1. Sign in as **Organization Admin**.
2. Open **Settings → Integrations → Razorpay → Connect**.
3. Enter from [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys):
   - **Key ID** (`rzp_live_…` for production)
   - **Key Secret**
   - **Webhook Secret** (from Webhooks settings)
4. Click **Test** then **Sync**.

Webhook URL for tenant `ORG_ID`:

```
https://app.asoftechinsightz.com/api/integrations/webhooks/razorpay?orgId=ORG_ID
```

## Option B — Platform live keys (`.env`)

On VPS `/opt/asoftech-insightz/.env`:

```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_live_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Also configure the legacy payment webhook if used:

```
https://app.asoftechinsightz.com/api/payments/webhook
```

## Verify

```bash
# After Docker rebuild
node scripts/ops/verify-razorpay-env.mjs asoftechinsightz
npm run production:acceptance
```

PAT treats Razorpay as **non-critical** during pilot when keys are missing, but live customer payments require either platform or tenant keys.

## Security

- Never commit live secrets to git.
- Rotate webhook secret if exposed.
- Use **live** keys (`rzp_live_`) only on production VPS.
- Test keys (`rzp_test_`) are fine for staging.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| PAT warns "keys missing" | Connect tenant integration OR set `.env` keys |
| 401 on verify script | Wrong key secret or revoked key |
| Webhook 401 | Mismatch webhook secret in integration vs Razorpay dashboard |
| Checkout fails | Ensure `NEXT_PUBLIC_RAZORPAY_KEY_ID` matches connected key ID for client-side |

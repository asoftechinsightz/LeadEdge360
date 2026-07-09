# Integration Center — Customer Onboarding

Production-grade Integration Center for LeadEdge360 with per-tenant encrypted credentials, health monitoring, audit logs, and role-based configuration (Organization Admins only).

## Overview

| Capability | Status |
|------------|--------|
| Integration catalog (22 integrations, 5 phases) | ✅ |
| Phase 1 connectors (WhatsApp, Razorpay, Gmail, M365, Google Calendar) | ✅ |
| Phase 2 connectors (Google Ads, Facebook Leads, Instagram, GBP, LinkedIn) | ✅ |
| Encrypted credentials (`org_integrations`) | ✅ |
| Audit trail (`integration_audit_logs`) | ✅ |
| Health dashboard | ✅ |
| OAuth2 (Google, Microsoft) | ✅ |
| API key connect | ✅ |
| Webhook verification | ✅ |
| Background sync scheduler | ✅ |
| RBAC (admin-only configure) | ✅ |

## Access

1. Sign in as **Organization Admin** (`admin`, `ORG_ADMIN`, or `superadmin`).
2. Go to **Settings → Integrations**.
3. Use **Connect**, **Test**, **Sync**, and **Disconnect** on Phase 1 cards.

Non-admin users can view integration status but cannot change configuration.

## Phase 1 — Connect guides

### WhatsApp Business Cloud

1. In Meta Developer Console, create a WhatsApp Business app.
2. Copy **Phone Number ID**, **Permanent Access Token**, **App Secret**, and set a **Webhook Verify Token**.
3. Click **Connect** on the WhatsApp card and paste credentials.
4. Configure Meta webhook URL:
   ```
   https://YOUR_DOMAIN/api/integrations/webhooks/whatsapp?orgId=YOUR_ORG_ID
   ```
5. Click **Test** to verify Graph API reachability.
6. Click **Sync** to index existing WhatsApp threads.

### Razorpay

1. From Razorpay Dashboard → Settings → API Keys, copy **Key ID** and **Key Secret**.
2. Create a webhook secret under Webhooks.
3. Connect via the Razorpay card.
4. Point Razorpay webhooks to:
   ```
   https://YOUR_DOMAIN/api/integrations/webhooks/razorpay?orgId=YOUR_ORG_ID
   ```

### Gmail / Google Calendar (OAuth)

1. Ensure server env has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
2. Add authorized redirect URI:
   ```
   https://YOUR_DOMAIN/api/integrations/oauth/callback
   ```
3. Click **Connect** → **Authorize** on the Gmail or Google Calendar card.

### Microsoft 365 (OAuth)

1. Register an app in Azure AD with Mail.Read, Mail.Send, and `offline_access`.
2. Set env: `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, optional `MICROSOFT_TENANT_ID`.
3. Add redirect URI (same as Google OAuth callback path).
4. Connect via the Microsoft 365 card.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `INTEGRATION_ENCRYPTION_KEY` | AES-256 key source (falls back to `JWT_SECRET`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` | Microsoft OAuth |
| `META_APP_ID` / `META_APP_SECRET` | Facebook Lead Ads + Instagram |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Optional — full Google Ads API test |
| `INTEGRATION_CRON_SECRET` | Protects `/api/integrations/scheduler/run` |
| `INTEGRATION_SYNC_INTERVAL_MS` | Default 6h between auto-syncs |

**Never** hardcode customer API keys in `.env` — tenants store their own credentials via the UI.

## Background jobs

Schedule via cron or external scheduler:

```bash
# Sync all tenants (every 6 hours)
curl -X POST -H "Authorization: Bearer $INTEGRATION_CRON_SECRET" \
  "https://YOUR_DOMAIN/api/integrations/scheduler/run?task=sync"

# Health checks (hourly)
curl -X POST -H "Authorization: Bearer $INTEGRATION_CRON_SECRET" \
  "https://YOUR_DOMAIN/api/integrations/scheduler/run?task=health"
```

## Database indexes

After deploy:

```bash
npm run db:indexes
```

Collections: `org_integrations`, `integration_audit_logs`, `integration_sync_jobs`, `integration_calendar_events`.

## Verification

```bash
npm run test:unit -- tests/integrations-framework.test.js
npm run production:acceptance   # includes Integration Center API checks
npx playwright test e2e/enterprise/integrations.spec.js
```

## Phase 2 — Connect guides

### Google Ads / Google Business Profile

Uses the same Google OAuth client as Gmail. Add scopes are requested automatically per integration.

Optional: set `GOOGLE_ADS_DEVELOPER_TOKEN` on the server for full Ads API health checks.

### Facebook Lead Ads / Instagram Business

1. Create a Meta app at [developers.facebook.com](https://developers.facebook.com).
2. Set VPS env: `META_APP_ID`, `META_APP_SECRET`.
3. Add OAuth redirect: `https://YOUR_DOMAIN/api/integrations/oauth/callback`
4. Connect via Integration Center (OAuth).
5. Webhook URL (Lead Ads):  
   `https://YOUR_DOMAIN/api/integrations/webhooks/facebook_leads?orgId=ORG_ID`

### LinkedIn

1. Create app at [LinkedIn Developers](https://www.linkedin.com/developers/).
2. Set `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`.
3. Redirect URL: same OAuth callback as Google.
4. Connect LinkedIn card in Integration Center.

## Roadmap

- **Phase 3:** Slack, Teams, Zapier, n8n
- **Phase 4:** Tally, Zoho Books, QuickBooks, Xero
- **Phase 5:** OpenAI, Gemini, Claude, DeepSeek, Grok

Stub connectors return phase availability messages until implemented.

# Integration Center — Troubleshooting

## Connect fails with validation error

| Symptom | Cause | Fix |
|---------|-------|-----|
| `WHATSAPP_TOKEN_AND_PHONE_ID_REQUIRED` | Missing fields | Provide both Phone Number ID and Access Token |
| `RAZORPAY_KEY_ID_AND_SECRET_REQUIRED` | Incomplete Razorpay keys | Copy both from Razorpay dashboard |
| `Google OAuth not configured` | Server missing Google env | Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` on VPS |
| `Microsoft OAuth not configured` | Server missing Azure env | Set `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET` |

## Test connection fails

1. Confirm credentials are for the correct environment (live vs test).
2. Check Meta/Razorpay/Google service status pages.
3. Review **Recent audit log** on the Integrations tab for `test.failed` entries.
4. For OAuth integrations, disconnect and reconnect to refresh tokens.

## Webhook verification fails

1. Ensure webhook URL includes `?orgId=YOUR_ORG_ID`.
2. WhatsApp: verify token must match the value stored at connect time.
3. Razorpay: webhook secret must match Razorpay dashboard.
4. Check audit log for `webhook.rejected` events.

## OAuth redirect errors

1. Redirect URI must exactly match:
   `https://app.asoftechinsightz.com/api/integrations/oauth/callback`
2. Google Cloud Console → OAuth client → Authorized redirect URIs.
3. Azure App Registration → Authentication → Redirect URIs.

## Sync returns zero records

- **WhatsApp:** Sync counts existing threads in your org — send a message first if empty.
- **Google Calendar:** Sync pulls events from the last 7 days only.
- **Razorpay:** Sync indexes payment records already in LeadEdge360.

## Non-admin cannot configure

Expected behavior. Only Organization Admins (`admin`, `ORG_ADMIN`, `superadmin`) can connect/disconnect. Contact your tenant admin.

## Encryption errors in production

Set `INTEGRATION_ENCRYPTION_KEY` (32+ char secret) or ensure `JWT_SECRET` is not the dev default.

## PAT / health check failures

```bash
curl -H "Authorization: Bearer $TOKEN" https://YOUR_DOMAIN/api/integrations/health
```

Expect `200` with `success: true` and `summary` object.

## Support escalation

Include:

1. Organization ID (`orgId`)
2. Integration ID (e.g. `whatsapp`)
3. Timestamp from audit log
4. Redacted screenshot of health dashboard (no API keys)

Do **not** share raw access tokens in support tickets.

# Week 2 — Social Autopilot VPS Runbook

**Goal:** LinkedIn posts publish automatically from `/marketing-engine` calendar via n8n + hourly cron.

**Time:** ~45 minutes one-time setup on VPS.

---

## Prerequisites

| Item | Status |
|------|--------|
| `/marketing-engine` shows 3+ scheduled posts | ✅ from Week 1 seed |
| n8n running on VPS | `docker compose ps` shows `n8n` |
| LinkedIn Company Page admin access | Founder / marketing |
| [LinkedIn Developer App](https://www.linkedin.com/developers/) | Create if missing |

---

## Step 1 — LinkedIn Developer App (15 min)

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/) → **Create app**
2. Link to your **AsoftechInsightz Company Page**
3. Products → request:
   - **Share on LinkedIn**
   - **Sign In with LinkedIn** (optional)
4. **Auth** tab → add redirect URL:
   ```
   https://n8n.asoftechinsightz.com/rest/oauth2-credential/callback
   ```
   (Use your actual n8n subdomain.)
5. Copy **Client ID** and **Client Secret** — you will paste these in n8n only (not in LeadEdge360 `.env`).

---

## Step 2 — n8n workflow (10 min)

```bash
cd /opt/asoftech-insightz
docker compose up -d n8n
docker compose ps
```

1. Open n8n UI: `https://n8n.asoftechinsightz.com` (or `:5678` if no nginx)
2. **Workflows** → **Import from file** → `n8n/workflows/marketing-social-publish.json`
3. Open workflow:
   - **Marketing Publish Webhook** — note path `marketing-social-publish`
   - After **linkedin** switch branch → add **LinkedIn** node:
     - Credential: **LinkedIn OAuth2** (connect with Client ID/Secret from Step 1)
     - Action: **Create Post**
     - Text: `={{ $json.payload.body || $json.payload.caption }}`
4. **Activate** workflow
5. Copy webhook URL shown in n8n (production URL):
   ```
   http://n8n:5678/webhook/marketing-social-publish
   ```
   (Inside Docker network — app container uses hostname `n8n`.)

---

## Step 3 — LeadEdge360 `.env` (5 min)

Add or update on VPS `/opt/asoftech-insightz/.env`:

```bash
N8N_ENABLED=true
N8N_WEBHOOK_URL=http://n8n:5678/webhook/marketing-social-publish
N8N_WEBHOOK_SECRET=REPLACE_WITH_LONG_RANDOM_STRING
AGENT_CRON_SECRET=REPLACE_WITH_ANOTHER_LONG_RANDOM_STRING
```

Generate secrets:

```bash
openssl rand -hex 32   # run twice — one for each secret
```

Rebuild app:

```bash
cd /opt/asoftech-insightz
docker compose up -d app
```

---

## Step 4 — Hourly cron (5 min)

```bash
crontab -e
```

Add (replace `YOUR_AGENT_CRON_SECRET` with value from `.env`):

```cron
# LeadEdge360 — publish due marketing posts + daily tick (every hour)
0 * * * * curl -s -X POST http://127.0.0.1:3000/api/agents/scheduled/run \
  -H "Authorization: Bearer YOUR_AGENT_CRON_SECRET" \
  -H "Content-Type: application/json" \
  >> /var/log/leadedge-cron.log 2>&1
```

Or run the automated installer:

```bash
cd /opt/asoftech-insightz
bash scripts/vps-setup-week2-social-autopilot.sh
```

---

## Step 5 — Verify (10 min)

### 5a. Manual publish test

```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:3000/api/auth/login-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@asoftechinsightz.com","password":"YOUR_PASSWORD"}' \
  | jq -r .accessToken)

curl -s -X POST http://127.0.0.1:3000/api/marketing-engine/publisher/run \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 5b. Check n8n executions

n8n → **Executions** → should show webhook received with `marketing.content.publish` event.

### 5c. UI test

1. Login → `/marketing-engine`
2. Click **Publish Due Posts**
3. Confirm post appears on LinkedIn Company Page

### 5d. Cron test

```bash
CRON_SECRET=$(grep '^AGENT_CRON_SECRET=' .env | cut -d= -f2)
curl -s -X POST http://127.0.0.1:3000/api/agents/scheduled/run \
  -H "Authorization: Bearer $CRON_SECRET" | jq '{mode, orgCount}'
```

Expected: `{ "mode": "cron", "orgCount": N }`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| n8n webhook 404 | Workflow not **Active** — toggle on |
| App cannot reach n8n | Both in same `docker compose` network; use `http://n8n:5678/...` |
| LinkedIn 401 | Re-auth OAuth credential in n8n |
| Posts stay `scheduled` | Cron not running — check `crontab -l` and `/var/log/leadedge-cron.log` |
| Empty publisher result | No posts `dueAt <= now` — check calendar timezone (IST slots) |

---

## Related

- [SOCIAL_AUTOPILOT_SETUP.md](./SOCIAL_AUTOPILOT_SETUP.md) — architecture overview
- [MARKETING_ENGINE_VALIDATION_AND_QUEUE.md](./MARKETING_ENGINE_VALIDATION_AND_QUEUE.md) — pending queue checks
- [LINKEDIN_WEEK1_POSTS.md](./LINKEDIN_WEEK1_POSTS.md) — post copy reference

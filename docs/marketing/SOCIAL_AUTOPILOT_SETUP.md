# Social Media Autopilot — Setup Guide (AsoftechInsightz)

**Short answer:** Yes — once you connect platform APIs via **n8n OAuth**, LeadEdge360 can schedule and publish posts every day automatically.

Your VPS already has:
- 7 LinkedIn posts scheduled (9:00 AM IST) in `/marketing-engine`
- Publisher agent that fires when `scheduledAt` is due
- n8n workflow skeleton at `n8n/workflows/marketing-social-publish.json`

What's missing: **platform OAuth in n8n** + **hourly cron** + **n8n env vars**.

---

## How it works (end-to-end)

```
Sunday (optional)     Marketing Planner → creates next week's content
Every day 9:00 AM     Post scheduled in marketing_calendar
Every hour            Cron → Publisher → checks due posts
                      → Sends webhook to n8n
                      → n8n posts to LinkedIn / Facebook / Instagram
```

You do **not** give us your social media password. Platforms use **OAuth** (secure app authorization).

---

## What access you need to provide

| Platform | What to set up | Who needs access |
|----------|----------------|------------------|
| **LinkedIn** | [LinkedIn Developer App](https://www.linkedin.com/developers/) + Company Page admin | Founder / marketing admin |
| **Facebook** | [Meta for Developers](https://developers.facebook.com/) + Business Page | Page admin |
| **Instagram** | Same Meta app (Instagram Business account linked to FB Page) | Page admin |
| **Google Business** | Google Business Profile API (optional) | Profile owner |

### LinkedIn (recommended — start here)

1. Create LinkedIn Developer App
2. Request products: **Share on LinkedIn**, **Sign In with LinkedIn**
3. Add redirect URL: `https://your-n8n-domain/rest/oauth2-credential/callback`
4. In n8n → Credentials → **LinkedIn OAuth2** → connect your company page
5. In workflow → add **LinkedIn** node after "linkedin" switch output → action: **Create Post**

### Facebook + Instagram

1. Create Meta App → type: Business
2. Add Facebook Login + Instagram Graph API
3. Connect Facebook Page in n8n **Facebook Graph API** credential
4. For Instagram: use **Instagram Graph API** node (requires IG Business + linked FB Page)

---

## VPS setup (one-time)

### 1. Ensure n8n is running

```bash
cd /opt/asoftech-insightz
docker compose up -d n8n
docker compose ps
```

Open n8n UI (usually port 5678 or your nginx subdomain).

### 2. Import workflow

1. n8n → **Workflows** → **Import from file**
2. Upload: `n8n/workflows/marketing-social-publish.json`
3. Open workflow → connect **LinkedIn** / **Facebook** / **Instagram** nodes to each platform branch
4. **Activate** workflow
5. Copy webhook URL (e.g. `http://n8n:5678/webhook/marketing-social-publish`)

### 3. Add to `.env`

```bash
N8N_ENABLED=true
N8N_WEBHOOK_URL=http://n8n:5678/webhook/marketing-social-publish
N8N_WEBHOOK_SECRET=your-long-random-secret
AGENT_CRON_SECRET=your-cron-secret
```

Rebuild app after `.env` change:

```bash
docker compose up -d app
```

### 4. Enable hourly autopilot (cron)

```bash
crontab -e
```

Add:

```cron
# Publish due marketing posts every hour
0 * * * * curl -s -X POST http://127.0.0.1:3000/api/agents/scheduled/run \
  -H "Authorization: Bearer YOUR_AGENT_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"orgId":"asoftechinsightz"}' >> /var/log/leadedge-cron.log 2>&1
```

Replace `YOUR_AGENT_CRON_SECRET` with value from `.env`.

### 5. Verify in UI

1. Login → `/marketing-engine`
2. Confirm **7 posts** on calendar (Mon–Sun 9:00 AM)
3. Click **Publish Due Posts** (manual test)
4. Check n8n → **Executions** — should show webhook received

---

## Daily posting schedule (current config)

| Setting | Value |
|---------|--------|
| Posts seeded | 7 (Week 1 launch kit) |
| Default slot | 9:00 AM IST |
| Platforms enabled | LinkedIn, Google Business |
| Facebook / Instagram | Off until Meta connected |

### After Week 1

- **Sunday:** Planner auto-runs (creates next week's batch via cron)
- Or manually: `/marketing-engine` → **Run Weekly Planner**
- Or re-seed: `npm run marketing-engine:seed-asoftech` (idempotent for same week)

### Recommended daily cadence (Phase 1)

| Platform | Frequency |
|----------|-----------|
| LinkedIn | 1 post/day (9 AM IST) |
| Facebook | 3–5/week (repurpose LinkedIn) |
| Instagram | 3–5/week (shorter caption + image) |

---

## What you can share with us (safely)

| Safe to share | Do NOT share |
|---------------|--------------|
| n8n admin access (temporary) | Plain-text social passwords |
| LinkedIn Developer app credentials (in n8n only) | Personal LinkedIn login |
| Meta Business app tokens (in n8n only) | Bank / email passwords |
| Company Page admin invite | |

Best practice: **you** connect OAuth in n8n UI; we configure the workflow and LeadEdge360 side.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Posts in calendar but not publishing | Check cron running; run publisher manually from UI |
| n8n not receiving webhooks | Verify `N8N_WEBHOOK_URL` in `.env`; app container can reach `n8n` hostname |
| LinkedIn post fails | Token expired → re-auth credential in n8n |
| Planner retest FAIL | Non-blocking — weekly planner generates 130+ items (timeout). Use seeded 7 posts for now |
| `org asoftechinsightz not found` | Run `npm run pilot:align-org` or `pilot:provision` |

---

## Checklist before going live

- [ ] n8n workflow imported and **Active**
- [ ] LinkedIn OAuth connected in n8n
- [ ] `N8N_WEBHOOK_URL` set in `.env`
- [ ] Hourly cron installed
- [ ] Test: manual **Publish Due Posts** → post appears on LinkedIn
- [ ] `/marketing-engine` shows calendar entries

---

## Related

- [WEEK2_VPS_RUNBOOK.md](./WEEK2_VPS_RUNBOOK.md) — step-by-step VPS setup + cron installer
- [LINKEDIN_WEEK1_POSTS.md](./LINKEDIN_WEEK1_POSTS.md) — copy-paste posts
- [AI_MARKETING_ENGINE.md](../platform/AI_MARKETING_ENGINE.md) — full architecture

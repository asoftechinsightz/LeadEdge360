# Post-Deployment Validation Checklist

Run through this after every fresh deploy (or major upgrade).

## 1. Infrastructure
- [ ] `docker compose ps` — all 3 services `running` & `healthy`
- [ ] `sudo systemctl status caddy` (or nginx) — active (running)
- [ ] `sudo systemctl status postgresql` — active (running)
- [ ] `sudo ufw status` — only 22 (or custom SSH), 80, 443 open
- [ ] `sudo fail2ban-client status` — jails active
- [ ] Disk usage `df -h` — root volume < 80%

## 2. TLS / DNS
- [ ] `curl -sI https://app.asoftechinsightz.com | grep HTTP` — returns `HTTP/2 200`
- [ ] `curl -sI https://app.asoftechinsightz.com | grep -i strict-transport` — HSTS present
- [ ] SSL Labs grade `A` or above: https://www.ssllabs.com/ssltest/analyze.html?d=app.asoftechinsightz.com
- [ ] HTTP → HTTPS redirect works: `curl -I http://app.asoftechinsightz.com`
- [ ] `dig +short app.asoftechinsightz.com` returns the VPS IP

## 3. API smoke tests
- [ ] `curl https://app.asoftechinsightz.com/api/` → `{"ok":true,...}`
- [ ] `curl https://app.asoftechinsightz.com/api/agents` → 200, JSON array
- [ ] `curl https://app.asoftechinsightz.com/api/leads` → 200, leads list
- [ ] `curl -X POST https://app.asoftechinsightz.com/api/leads -H 'content-type: application/json' -d '{"name":"Smoke","phone":"+919999999999"}'` → 201 + score 0-100
- [ ] Razorpay test order: `curl -X POST .../api/billing/checkout -H 'content-type: application/json' -d '{"planId":"growth"}'` → 200 with `order.id`

## 4. Database
- [ ] `sudo -u postgres psql asoftech -c "\dt"` — 14 tables present
- [ ] `psql -c "SELECT count(*) FROM users WHERE email='admin@asoftechinsightz.com';"` — returns 1
- [ ] Admin login works at `/signin` with `admin@asoftechinsightz.com` / `ChangeMe@2025`
- [ ] **CHANGE the admin password** via `POST /api/users/change-password`
- [ ] Daily backup cron present: `sudo crontab -u postgres -l`

## 5. Integrations
- [ ] Emergent Auth callback whitelisted: open `/signin`, click “Continue with Google”, complete flow
- [ ] Razorpay test payment completes (use test card `4111 1111 1111 1111`)
- [ ] n8n flows imported and `Active`: WhatsApp ingest, FB Lead Ads, Google Lead Form, follow-up automation
- [ ] n8n webhook returns 201: `curl -X POST .../api/webhooks/whatsapp -H 'x-webhook-token: $N8N_WEBHOOK_TOKEN' -H 'content-type: application/json' -d '{"name":"WA Test","phone":"+919999999998"}'`
- [ ] LLM scoring engine = `llm` (not `rules-fallback`) on new leads — confirms `EMERGENT_LLM_KEY` works

## 6. Frontend
- [ ] Marketing pages: `/`, `/about`, `/products`, `/solutions`, `/industries`, `/contact`, `/blog`, `/privacy`, `/terms`
- [ ] Auth: `/signin` → `/splash` → product selection
- [ ] Suite V2: `/dashboard`, `/leadedge360`, `/leadedge360/leads`, `/leadedge360/opportunities`, `/retailedge360`
- [ ] Ops: `/proposals`, `/campaigns`, `/revenue`, `/payments`, `/invoices`, `/subscribe`
- [ ] DPDP consent banner on first visit (incognito)
- [ ] LeadEdge360: KPIs, lead create, pipeline, detail tabs
- [ ] RetailEdge360: KPIs, SKU create, re-predict, charts
- [ ] Billing: subscription panel, invoices, Razorpay checkout (test card)
- [ ] Mobile view (390×844): hamburger nav + card list views on tables

## 7. Observability
- [ ] UptimeRobot monitor green
- [ ] Sentry (if used) receiving events
- [ ] `audit_logs` getting populated as users perform actions
- [ ] Slow query log not growing rapidly

## 8. Security
- [ ] `.env` permissions `chmod 600`
- [ ] No secrets in git: `git log -p | grep -E 'sk-emergent|rzp_test|RAZORPAY_KEY_SECRET' | head` returns nothing
- [ ] Fail2ban shows attempted bans in the last 24h (proves it's running)
- [ ] PostgreSQL listens on `localhost` only: `ss -tlnp | grep 5432`
- [ ] Default admin password rotated
- [ ] DPDP grievance officer email in footer + `/privacy` page resolves

## 9. Backup & DR
- [ ] Recent backup exists: `ls -lh /var/backups/postgres/`
- [ ] Test restore on a staging machine quarterly
- [ ] Offsite copy verified (S3/Backblaze sync log)

## 10. Documentation
- [ ] Operator runbook printed and pinned (this file)
- [ ] On-call rota set for the next 90 days
- [ ] Customer-facing status page configured (statuspage.io / instatus / cstate)

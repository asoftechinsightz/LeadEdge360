# Server Security Hardening — Ubuntu VPS

Follow these steps after the initial deploy. Skipping these is the #1 cause of breach incidents.

## 1. OS baseline

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install unattended-upgrades fail2ban ufw auditd
sudo dpkg-reconfigure -plow unattended-upgrades   # enable automatic security updates
```

## 2. SSH hardening

```bash
sudo nano /etc/ssh/sshd_config
```
```conf
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
AllowUsers asoftech
MaxAuthTries 3
ClientAliveInterval 300
```
```bash
sudo systemctl restart ssh
```

Optional: change SSH port to a high number (e.g. 2222) and update UFW + Caddy/Nginx accordingly.

## 3. Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH        # or your custom SSH port
sudo ufw allow 80,443/tcp
sudo ufw --force enable
```

## 4. Fail2ban

The default profile already protects SSH. Add Caddy/Nginx jails:
```bash
sudo tee /etc/fail2ban/jail.local <<'EOF'
[sshd]
enabled = true
maxretry = 4
findtime = 10m
bantime = 1h

[caddy-4xx]
enabled = true
filter = caddy-4xx
port = http,https
logpath = /var/log/caddy/access.log
maxretry = 30
findtime = 10m
bantime = 2h
EOF
```
```bash
sudo systemctl restart fail2ban
```

## 5. PostgreSQL

- `listen_addresses = 'localhost'` (default — only expose externally if you must)
- `pg_hba.conf` — only `scram-sha-256`, never `trust`
- Per-tenant DB users? Skip — use the app-level tenant scoping (`tenant_id`) we already enforce.
- Rotate `asoftech` user password every 90 days.

## 6. App-layer

| Concern | Mitigation |
|---|---|
| **Passwords** | bcrypt cost 10+; never store plaintext |
| **JWT** | 15-min access TTL, 30-day rotating refresh, HS256 with a 256-bit secret in `JWT_SECRET` |
| **OTPs** | 5-min TTL, max 5 attempts, bcrypt-hashed, rate-limited to 3/min/IP |
| **CSRF** | The cookie-based session uses `SameSite=Lax`; mobile JWT bearer flow is CSRF-immune |
| **CORS** | Restrict `CORS_ORIGINS` to your apex + app subdomain |
| **Rate-limiting** | Recommended: deploy `caddy-ratelimit` or nginx `limit_req` on `/api/auth/*` |
| **Input** | Server-side validation on every body (Zod recommended); SQL via parameterised queries only |
| **Outbound** | All third-party callouts time-bound (9s LLM, 5s SMS), with exponential back-off |
| **Secrets** | `.env` chmod 600, never logged, rotate quarterly |
| **HSTS** | Caddy auto-adds 31536000; do not lower |
| **Webhooks** | HMAC SHA-256 signature verification on Razorpay + n8n inbound |
| **DPDP** | Consent log per user; right-to-erasure deletes all tenant rows in one transaction (see `docs/sql/utility-queries.sql`) |

## 7. TLS configuration

Caddy automatically issues Let's Encrypt certs with ECDSA P-256. To use a paid cert:
```caddyfile
app.asoftechinsightz.com {
    tls /etc/ssl/asoftech.crt /etc/ssl/asoftech.key
    reverse_proxy localhost:3000
}
```

Minimum modern profile (Mozilla “Intermediate”): Caddy uses TLS 1.2+ by default — do not lower.

## 8. Logging & monitoring

```bash
# centralised app + caddy logs
sudo journalctl -u caddy -f
docker compose logs -f app
```

Recommended free-tier stack:
- **UptimeRobot** → ping `https://app.asoftechinsightz.com/api/` every 5 min
- **Sentry** → errors (paid SaaS or self-hosted)
- **Plausible** → privacy-friendly analytics, GDPR/DPDP compliant

## 9. Auditing

- `audit_logs` table records every CUD on leads, follow-ups, users, subscriptions.
- Quarterly review: `SELECT action, count(*) FROM audit_logs WHERE created_at > now()-interval '90 days' GROUP BY 1 ORDER BY 2 DESC;`

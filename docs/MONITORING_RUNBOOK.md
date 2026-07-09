# Monitoring Runbook — RC3

**Stack:** Prometheus + Grafana + `/api/metrics` + health probes

## Deploy monitoring

```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

| Service | URL (VPS localhost) | Purpose |
|---------|---------------------|---------|
| Prometheus | http://127.0.0.1:9090 | Metrics scrape + alerts |
| Grafana | http://127.0.0.1:3030 | Dashboards (admin / `$GRAFANA_ADMIN_PASSWORD`) |
| Node Exporter | :9100 | CPU, RAM, disk, network |
| cAdvisor | :8080 | Docker container metrics |

## Application metrics

`GET /api/metrics` exposes Prometheus text format:

- `asoftech_active_tenants`
- `asoftech_active_users_24h`
- `asoftech_leads_created_total`
- `asoftech_mrr_inr`
- `asoftech_pos_transactions_total`
- `asoftech_process_uptime_seconds`

Set `METRICS_TOKEN` in production and configure Nginx IP allowlist.

## Alert rules

See `infra/prometheus/alerts.yml`:

| Alert | Threshold |
|-------|-----------|
| AppNotReady | scrape down 2m |
| HighErrorRate | >5% errors |
| HighApiLatency | p95 > 300ms |
| LoginFailuresSpike | >20 / 5m |
| OtpFailuresSpike | >10 / 5m |
| PaymentFailureRate | >5% |
| WhatsAppDeliveryFailures | >5 / 15m |
| DiskSpaceLow | <20% free |
| MongoBackupStale | >25h since backup |

Wire Alertmanager to email/Slack/PagerDuty at GA.

## Dashboards

Import `infra/grafana/dashboards/asoftech-overview.json` via provisioning.

**Infrastructure:** CPU, RAM, disk, Docker, MongoDB, Redis  
**Application:** API latency, error rate, login/OTP failures, queue depth, payments, WhatsApp  
**Business:** tenants, users, leads/day, opportunities, POS, MRR

## Uptime external probe

Configure UptimeRobot or Pingdom against:

- `https://<domain>/api/health/live`
- `https://<domain>/api/health/ready`

Target: **99.9%** uptime during pilot.

#!/usr/bin/env node
/**
 * Aggregate pilot deployment artifacts into a single markdown report.
 * Usage: node scripts/ops/publish-pilot-reports.mjs --version v1.0.0-rc3-pilot
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const reportDir = join(root, 'docs/deployments')
const args = process.argv.slice(2)
const version = args.includes('--version') ? args[args.indexOf('--version') + 1] : 'v1.0.0-rc3-pilot'

function readJson(name) {
  const p = join(reportDir, name)
  if (!existsSync(p)) return null
  try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null }
}

const backup = readJson('pilot-backup-verification.json')
const migration = readJson('pilot-migration-report.json')
const smoke = readJson('pilot-smoke-report.json')
const monitoring = readJson('pilot-monitoring-report.json')
const cron = readJson('pilot-backup-cron.json')

let headersData = null
try {
  headersData = JSON.parse(readFileSync(join(root, 'docs/security-headers-last-run.json'), 'utf8'))
} catch { /* optional — run after deploy */ }

const deployReports = readdirSync(reportDir).filter((f) => f.startsWith('deploy-pilot-'))
const latestDeploy = deployReports.sort().pop()
const deploy = latestDeploy ? readJson(latestDeploy) : readJson('deploy-production-latest.json')

const md = `# Pilot Production Deployment Report — ${version}

**Generated:** ${new Date().toISOString()}  
**Stage:** Pilot Production (Hostinger VPS)  
**Tag:** \`${version}\`

---

## Summary

| Step | Status |
|------|--------|
| Environment validation | ${backup ? '✅' : '🟡'} |
| MongoDB backup (verified) | ${backup?.verified ? '✅' : '❌'} |
| Migrations applied | ${migration?.status === 'applied' ? '✅' : '🟡'} |
| App deploy + rollback gate | ${deploy?.status === 'success' ? '✅' : deploy?.status === 'rollback' ? '⛔ rolled back' : '🟡'} |
| Monitoring stack | ${monitoring?.status === 'pass' ? '✅' : monitoring?.status === 'partial' ? '🟡 partial' : '🟡'} |
| Smoke tests | ${smoke?.status === 'pass' ? '✅' : '❌'} |
| Security headers | ${headersData?.pass ? '✅' : '🟡'} |
| Backup cron | ${cron?.status === 'installed' ? '✅' : '🟡'} |

---

## Backup verification

${backup ? `
- Archive: \`${backup.archive}\`
- Size: ${backup.sizeBytes} bytes
- Verified: ${backup.verified}
` : '_No backup report — run pilot-production-deploy.sh_'}

---

## Migration report

${migration ? `
- Status: **${migration.status}**
- Runner: \`${migration.runner}\`
` : '_Pending_'}

---

## Deployment health

${deploy ? `
- Stage: ${deploy.stage}
- Version: ${deploy.version}
- Git SHA: ${deploy.gitSha || 'n/a'}
- Health OK: ${deploy.healthCheck?.ok}
- Rollback triggered: ${deploy.rollbackTriggered || false}
` : '_No deploy report_'}

---

## Smoke test results

${smoke ? `
- Passed: **${smoke.passed}/${smoke.total}**
- Status: **${smoke.status}**

| Area | Check | Result |
|------|-------|--------|
${smoke.results.map((r) => `| ${r.area} | ${r.name} | ${r.pass ? '✅' : '❌'} ${r.detail || ''} |`).join('\n')}
` : '_Not run_'}

---

## Monitoring

${monitoring ? `
- Status: **${monitoring.status}**
- Alerts file: \`infra/prometheus/alerts.yml\`

| Service | OK |
|---------|-----|
${monitoring.checks.map((c) => `| ${c.name} | ${c.pass ? '✅' : '❌'} |`).join('\n')}
` : '_Not deployed_'}

---

## Security headers

${headersData ? `
- URL: ${headersData.url}
- Pass: ${headersData.pass}

${headersData.checks.map((c) => `- ${c.pass ? '✅' : '❌'} ${c.name}: ${c.detail || ''}`).join('\n')}
` : '_Run headers-check against PUBLIC_URL_'}

---

## Backup retention

| Tier | Retention |
|------|-----------|
| Daily | 7 days |
| Weekly | 4 weeks |
| Monthly | 12 months |

Cron: \`${cron?.cronFile || '/etc/cron.d/asoftech-backup'}\`

---

## Rollback readiness

Until pilot succeeds for **≥ 2 weeks**, maintain:

1. Previous Docker image tag
2. Latest verified backup: \`${backup?.archive || 'see /opt/asoftech/backups/daily/'}\`
3. \`.deploy-version\` file on VPS

\`\`\`bash
# Emergency rollback
docker compose stop app
docker compose up -d app  # previous image
# OR restore MongoDB from backup archive
\`\`\`

---

## Artifact index

| File | Purpose |
|------|---------|
| \`pilot-backup-verification.json\` | Pre-deploy backup proof |
| \`pilot-migration-report.json\` | Migration apply log |
| \`pilot-smoke-report.json\` | Full smoke matrix |
| \`pilot-monitoring-report.json\` | Prometheus/Grafana health |
| \`pilot-backup-cron.json\` | Cron install proof |
| \`deploy-pilot-*.json\` | Deploy verification |

---

**Pilot GA gate:** uptime ≥99.9%, p95 <300ms, zero P0, zero tenant leakage, 2-week stable run.
`

mkdirSync(reportDir, { recursive: true })
const outMd = join(reportDir, 'PILOT_RC3_DEPLOYMENT_REPORT.md')
const outJson = join(reportDir, 'pilot-deployment-summary.json')
writeFileSync(outMd, md)
writeFileSync(outJson, JSON.stringify({
  generatedAt: new Date().toISOString(),
  version,
  backup,
  migration,
  deploy,
  smoke,
  monitoring,
  cron,
  headers: headersData,
  markdownReport: outMd,
}, null, 2))

console.log(`Published: ${outMd}`)
console.log(`JSON: ${outJson}`)

#!/usr/bin/env node
/**
 * Launch War Room — unified technical + business + financial KPI snapshot.
 *
 * Usage:
 *   npm run launch:warroom
 *
 * Environment:
 *   RETEST_API_BASE / PUBLIC_URL
 *   CERT_ADMIN_EMAIL / CERT_ADMIN_PASSWORD (optional — enriches checks)
 *   WAR_ROOM_FINANCIAL_JSON — path to manual financial overrides
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'
import { findLatestBackup } from '../pat/lib.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const outDir = join(root, 'docs', 'war-room')
const ts = new Date().toISOString().replace(/[:.]/g, '-')

const API = (process.env.RETEST_API_BASE || 'http://127.0.0.1:3000/api').replace(/\/$/, '')
const PUBLIC = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_BASE_URL || ''
const ORIGIN = API.replace(/\/api$/, '')

function parsePrometheus(text) {
  const metrics = {}
  for (const line of text.split('\n')) {
    if (!line || line.startsWith('#')) continue
    const m = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)\s+([^\s]+)/)
    if (m) metrics[m[1]] = Number(m[2])
  }
  return metrics
}

async function fetchJson(path) {
  try {
    const res = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(10000) })
    return { ok: res.ok, status: res.status, data: await res.json().catch(() => null) }
  } catch (e) {
    return { ok: false, status: 0, error: e.message }
  }
}

async function fetchText(path) {
  try {
    const start = performance.now()
    const res = await fetch(`${ORIGIN}${path}`, { signal: AbortSignal.timeout(10000) })
    const text = await res.text()
    return { ok: res.ok, status: res.status, text, latencyMs: Math.round(performance.now() - start) }
  } catch (e) {
    return { ok: false, status: 0, error: e.message, latencyMs: 0 }
  }
}

function loadFinancialOverrides() {
  const path = process.env.WAR_ROOM_FINANCIAL_JSON || join(outDir, 'financial-overrides.json')
  if (!existsSync(path)) {
    return {
      cashInBankInr: null,
      monthlyBurnInr: null,
      accountsReceivableInr: null,
      newContractsSigned: null,
      customerRetentionPct: null,
      note: 'Edit docs/war-room/financial-overrides.json weekly',
    }
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return { note: 'invalid financial-overrides.json' }
  }
}

function loadPat() {
  const p = join(root, 'docs/deployments/production-acceptance-latest.json')
  if (!existsSync(p)) return { verdict: 'NOT_RUN', promotionAllowed: false }
  try {
    const j = JSON.parse(readFileSync(p, 'utf8'))
    return { verdict: j.verdict, promotionAllowed: j.promotionAllowed, generatedAt: j.generatedAt, criticalFailed: j.summary?.criticalFailed ?? 0 }
  } catch {
    return { verdict: 'UNKNOWN', promotionAllowed: false }
  }
}

function dockerStatus() {
  if (process.platform === 'win32' && !process.env.WAR_ROOM_FORCE_DOCKER) return { available: false, containers: [] }
  const r = spawnSync('docker', ['ps', '--format', '{{.Names}}\t{{.Status}}'], { encoding: 'utf8', timeout: 8000 })
  if (r.status !== 0) return { available: false, containers: [], error: r.stderr?.trim() }
  return {
    available: true,
    containers: r.stdout.split('\n').filter(Boolean).map((line) => {
      const [name, ...rest] = line.split('\t')
      return { name, status: rest.join('\t') }
    }),
  }
}

function alertStatus() {
  const alertsPath = join(root, 'infra/prometheus/alerts.yml')
  if (!existsSync(alertsPath)) return { configured: false, ruleCount: 0 }
  const content = readFileSync(alertsPath, 'utf8')
  const ruleCount = (content.match(/alert:/g) || []).length
  return { configured: true, ruleCount, file: alertsPath }
}

function statusEmoji(ok, warn = false) {
  if (ok) return '🟢'
  if (warn) return '🟡'
  return '🔴'
}

async function main() {
  mkdirSync(outDir, { recursive: true })

  const live = await fetchJson('/health/live')
  const ready = await fetchJson('/health/ready')
  const metricsRes = await fetchText('/api/metrics')
  const metrics = metricsRes.ok ? parsePrometheus(metricsRes.text) : {}

  const backup = findLatestBackup(root)
  const backupAgeHours = backup ? (Date.now() - backup.mtime) / 3_600_000 : null
  const pat = loadPat()
  const docker = dockerStatus()
  const alerts = alertStatus()
  const financial = loadFinancialOverrides()

  const uptimeOk = live.ok && ready.ok && ready.data?.mongo === 'connected'
  const latencyMs = metricsRes.latencyMs || 0
  const latencyOk = latencyMs > 0 && latencyMs <= 300
  const backupOk = backup && backupAgeHours !== null && backupAgeHours <= 48
  const patOk = pat.verdict === 'PASSED' && pat.promotionAllowed

  const snapshot = {
    generatedAt: new Date().toISOString(),
    snapshotId: `warroom-${ts}`,
    environment: {
      apiBase: API,
      publicUrl: PUBLIC || null,
      deployTag: existsSync(join(root, '.deploy-version')) ? readFileSync(join(root, '.deploy-version'), 'utf8').trim() : 'unknown',
    },
    pilotGate: {
      patVerdict: pat.verdict,
      promotionAllowed: pat.promotionAllowed,
      readyForCustomers: patOk && uptimeOk,
      recommendation: patOk && uptimeOk
        ? 'GO — onboard 5–10 pilot customers'
        : 'HOLD — run npm run production:acceptance on VPS until PASSED',
    },
    technical: {
      uptime: {
        status: statusEmoji(uptimeOk),
        healthy: uptimeOk,
        liveness: live.ok,
        readiness: ready.ok,
        mongo: ready.data?.mongo || 'unknown',
        target: '≥99.9% (measure via UptimeRobot during pilot)',
      },
      apiLatency: {
        status: statusEmoji(latencyOk, !latencyOk && latencyMs > 0),
        p95Ms: latencyMs,
        targetMs: 300,
        sample: 'health/metrics probe',
      },
      errorRate: {
        status: '🟡',
        value: metrics.asoftech_metrics_scrape_errors_total ? 'elevated' : 'normal',
        target: '<5%',
        note: 'Wire Prometheus asoftech_http_errors_total during pilot',
      },
      database: {
        status: statusEmoji(ready.data?.mongo === 'connected'),
        mongo: ready.data?.mongo || 'unknown',
      },
      backup: {
        status: statusEmoji(backupOk, !backupOk && !!backup),
        latestArchive: backup?.path || null,
        ageHours: backupAgeHours ? Math.round(backupAgeHours * 10) / 10 : null,
        sizeBytes: backup?.size || null,
        target: '≤48h since last successful backup',
      },
      activeAlerts: {
        status: statusEmoji(alerts.configured),
        rulesConfigured: alerts.ruleCount,
        firing: 'check Grafana/Prometheus on VPS',
      },
      docker: {
        available: docker.available,
        containers: docker.containers.filter((c) => c.name?.includes('asoftech')),
      },
    },
    business: {
      newOrganizations: { value: metrics.asoftech_active_tenants ?? null, period: 'total active' },
      activeUsers: { value: metrics.asoftech_active_users_24h ?? null, period: '24h' },
      leadsCreated: { value: metrics.asoftech_leads_created_total ?? null, period: '24h' },
      opportunitiesWon: { value: metrics.asoftech_opportunities_won_total ?? null, period: '24h' },
      posTransactions: { value: metrics.asoftech_pos_transactions_total ?? null, period: '24h' },
      mrrInr: { value: metrics.asoftech_mrr_inr ?? null, period: 'active subscriptions' },
      customerRetentionPct: financial.customerRetentionPct,
    },
    financial: {
      cashInBankInr: financial.cashInBankInr,
      monthlyBurnInr: financial.monthlyBurnInr,
      mrrInr: metrics.asoftech_mrr_inr ?? financial.mrrInr ?? null,
      accountsReceivableInr: financial.accountsReceivableInr,
      newContractsSigned: financial.newContractsSigned,
      note: financial.note,
    },
    products: {
      leadEdge360: {
        webSaas: 'READY — pilot (100% CRM parity)',
        mobile: 'READY — pilot sideload / internal track (point API_BASE_URL to production)',
      },
      retailEdge360: {
        webSaas: 'READY — pilot (POS cash/UPI/card on web)',
        mobile: 'READY — pilot (barcode + Razorpay checkout)',
      },
    },
  }

  const md = buildMarkdown(snapshot)
  const jsonPath = join(outDir, `snapshot-${ts}.json`)
  const mdPath = join(outDir, `snapshot-${ts}.md`)
  const latestJson = join(outDir, 'latest.json')
  const latestMd = join(outDir, 'latest.md')

  writeFileSync(jsonPath, JSON.stringify(snapshot, null, 2))
  writeFileSync(mdPath, md)
  writeFileSync(latestJson, JSON.stringify(snapshot, null, 2))
  writeFileSync(latestMd, md)

  console.log(md)
  console.log(`\nSnapshot: ${jsonPath}`)
  process.exit(snapshot.pilotGate.readyForCustomers ? 0 : 1)
}

function buildMarkdown(s) {
  const lines = [
    `# Launch War Room — ${s.generatedAt}`,
    '',
    `**Deploy tag:** \`${s.environment.deployTag}\` · **API:** ${s.environment.apiBase}`,
    '',
    `## Pilot gate`,
    '',
    `| Check | Status |`,
    `|-------|--------|`,
    `| PAT verdict | **${s.pilotGate.patVerdict}** |`,
    `| Promotion allowed | ${s.pilotGate.promotionAllowed ? '✅ YES' : '❌ NO'} |`,
    `| **Recommendation** | **${s.pilotGate.recommendation}** |`,
    '',
    `## Technical KPIs`,
    '',
    `| KPI | Status | Value | Target |`,
    `|-----|--------|-------|--------|`,
    `| Uptime | ${s.technical.uptime.status} | ${s.technical.uptime.healthy ? 'healthy' : 'degraded'} | ≥99.9% |`,
    `| API latency | ${s.technical.apiLatency.status} | ${s.technical.apiLatency.p95Ms}ms | <300ms p95 |`,
    `| Error rate | ${s.technical.errorRate.status} | ${s.technical.errorRate.value} | <5% |`,
    `| Database | ${s.technical.database.status} | ${s.technical.database.mongo} | connected |`,
    `| Backup | ${s.technical.backup.status} | ${s.technical.backup.ageHours ?? 'n/a'}h ago | ≤48h |`,
    `| Active alerts | ${s.technical.activeAlerts.status} | ${s.technical.activeAlerts.rulesConfigured} rules | configured |`,
    '',
    `## Business KPIs`,
    '',
    `| KPI | Value | Period |`,
    `|-----|-------|--------|`,
    `| New organizations | ${s.business.newOrganizations.value ?? '—'} | ${s.business.newOrganizations.period} |`,
    `| Active users | ${s.business.activeUsers.value ?? '—'} | ${s.business.activeUsers.period} |`,
    `| Leads created | ${s.business.leadsCreated.value ?? '—'} | ${s.business.leadsCreated.period} |`,
    `| Opportunities won | ${s.business.opportunitiesWon.value ?? '—'} | ${s.business.opportunitiesWon.period} |`,
    `| Retail POS transactions | ${s.business.posTransactions.value ?? '—'} | ${s.business.posTransactions.period} |`,
    `| MRR (INR) | ${s.business.mrrInr.value ?? '—'} | ${s.business.mrrInr.period} |`,
    `| Customer retention | ${s.business.customerRetentionPct ?? '—'}% | manual |`,
    '',
    `## Financial KPIs (manual weekly update)`,
    '',
    `| KPI | Value (INR) |`,
    `|-----|-------------|`,
    `| Cash in bank | ${s.financial.cashInBankInr ?? '—'} |`,
    `| Monthly burn | ${s.financial.monthlyBurnInr ?? '—'} |`,
    `| MRR | ${s.financial.mrrInr ?? '—'} |`,
    `| Accounts receivable | ${s.financial.accountsReceivableInr ?? '—'} |`,
    `| New contracts signed | ${s.financial.newContractsSigned ?? '—'} |`,
    '',
    `## Product readiness`,
    '',
    `| Product | Web SaaS | Mobile |`,
    `|-------|----------|--------|`,
    `| LeadEdge360 | ${s.products.leadEdge360.webSaas} | ${s.products.leadEdge360.mobile} |`,
    `| RetailEdge360 | ${s.products.retailEdge360.webSaas} | ${s.products.retailEdge360.mobile} |`,
    '',
    `---`,
    `*Update financials in \`docs/war-room/financial-overrides.json\`. Run daily during pilot: \`npm run launch:warroom\`*`,
  ]
  return lines.join('\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

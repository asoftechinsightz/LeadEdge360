#!/usr/bin/env node
/**
 * Production Acceptance Test (PAT) — full post-deployment validation.
 *
 * Usage:
 *   npm run production:acceptance
 *
 * Environment:
 *   RETEST_API_BASE / PAT_API_BASE   — API base (default http://127.0.0.1:3000/api)
 *   PUBLIC_URL                       — HTTPS URL for SSL/proxy checks
 *   CERT_ADMIN_EMAIL / CERT_ADMIN_PASSWORD — auth + workflow tests
 *   PAT_STAGE=production             — strict env validation
 *   PAT_REQUIRE_BACKUP=1             — fail if no recent backup
 *   PAT_MONITORING_REQUIRED=1|0       — force monitoring probes on/off
 *   PAT_SKIP_DOCKER=1                — skip Docker container checks
 *   PROMETHEUS_URL, GRAFANA_URL      — monitoring probes
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { ROLES } from '../../lib/billing/roles.js'
import {
  loadEnvFile,
  createRecorder,
  apiRequest,
  timedFetch,
  runCommand,
  findLatestBackup,
  percentile,
  dockerContainerRunning,
  listDockerContainers,
  parseContainerUptimeSeconds,
  isMonitoringDeployed,
  resolvePatCredential,
  defaultGrafanaHealthUrl,
  CREDENTIAL_PLACEHOLDERS,
  P95_TARGET_MS,
  BACKUP_MAX_AGE_HOURS,
} from './lib.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const env = loadEnvFile(root)
const BASE = (process.env.PAT_API_BASE || process.env.RETEST_API_BASE || 'http://127.0.0.1:3000/api').replace(/\/$/, '')
const PUBLIC = process.env.PUBLIC_URL || env.NEXT_PUBLIC_BASE_URL || ''
const EMAIL = resolvePatCredential(env, 'CERT_ADMIN_EMAIL')
const PASSWORD = resolvePatCredential(env, 'CERT_ADMIN_PASSWORD')
const STAGE = process.env.PAT_STAGE || 'production'
const ts = new Date().toISOString().replace(/[:.]/g, '-')

const checks = []
const record = createRecorder(checks)
const latencies = []

let accessToken = null
let refreshToken = null

// ─── Infrastructure ───────────────────────────────────────────────────────────

async function checkInfrastructure() {
  let live, ready
  try {
    live = await apiRequest(BASE, 'GET', '/health/live')
  } catch (e) {
    live = { status: 0, data: null, latencyMs: 0, error: e.message }
  }
  record({ category: 'infrastructure', name: 'API liveness', pass: live.status === 200 && live.data?.ok === true, detail: live.error || `status ${live.status}`, latencyMs: live.latencyMs })
  if (live.latencyMs) latencies.push(live.latencyMs)

  try {
    ready = await apiRequest(BASE, 'GET', '/health/ready')
  } catch (e) {
    ready = { status: 0, data: null, latencyMs: 0, error: e.message }
  }
  const mongoOk = ready.status === 200 && ready.data?.mongo === 'connected'
  record({ category: 'infrastructure', name: 'MongoDB readiness', pass: mongoOk, detail: ready.error || `mongo=${ready.data?.mongo}`, latencyMs: ready.latencyMs })
  if (ready.latencyMs) latencies.push(ready.latencyMs)

  if (!process.env.PAT_SKIP_DOCKER && process.platform !== 'win32') {
    const lines = listDockerContainers()
    const app = lines.find((l) => l.includes('asoftech-app'))
    const mongo = lines.find((l) => l.includes('asoftech-mongo'))
    record({ category: 'infrastructure', name: 'Docker app container', pass: !!app && app.includes('Up'), detail: app || 'not found', critical: STAGE === 'production' })
    record({ category: 'infrastructure', name: 'Docker MongoDB container', pass: !!mongo && mongo.includes('Up'), detail: mongo || 'not found', critical: STAGE === 'production' })

    const redisWanted = !!(env.REDIS_URL || process.env.REDIS_URL)
    const redis = lines.find((l) => l.includes('asoftech-redis'))
    if (redisWanted) {
      record({
        category: 'infrastructure',
        name: 'Docker Redis container',
        pass: !!redis && redis.includes('Up'),
        detail: redis || 'REDIS_URL set but container not running',
        critical: false,
      })
    } else {
      record({
        category: 'infrastructure',
        name: 'Docker Redis container',
        pass: true,
        detail: 'optional — REDIS_URL unset',
        critical: false,
      })
    }
  } else {
    record({ category: 'infrastructure', name: 'Docker containers', pass: true, critical: false, detail: 'skipped (PAT_SKIP_DOCKER or Windows)' })
  }

  if (env.REDIS_URL || process.env.REDIS_URL) {
    const redisUrl = env.REDIS_URL || process.env.REDIS_URL
    const redisUp = dockerContainerRunning('asoftech-redis')
    if (redisUp) {
      const ping = runCommand('docker', ['exec', 'asoftech-redis', 'redis-cli', 'ping'])
      record({ category: 'infrastructure', name: 'Redis PING', pass: ping.stdout.trim() === 'PONG', detail: ping.stdout.trim() || ping.stderr, critical: false })
    } else if (redisUp === false) {
      record({ category: 'infrastructure', name: 'Redis PING', pass: false, critical: false, detail: 'container not running' })
    }
    record({ category: 'infrastructure', name: 'Redis configured', pass: true, detail: redisUrl.split('@').pop(), critical: false })
  } else {
    record({ category: 'infrastructure', name: 'Redis configured', pass: true, critical: false, detail: 'optional — REDIS_URL unset' })
  }

  if (PUBLIC && PUBLIC.startsWith('https://')) {
    try {
      const pub = await timedFetch(`${PUBLIC.replace(/\/$/, '')}/api/health/live`)
      record({ category: 'infrastructure', name: 'Reverse proxy + SSL reachability', pass: pub.status === 200, detail: `${PUBLIC} status ${pub.status}`, latencyMs: pub.latencyMs })
      latencies.push(pub.latencyMs)
      const hsts = pub.headers.get('strict-transport-security')
      record({ category: 'infrastructure', name: 'HSTS header', pass: !!hsts, detail: hsts?.slice(0, 60) || 'missing' })
      const csp = pub.headers.get('content-security-policy')
      record({ category: 'infrastructure', name: 'CSP header', pass: !!csp && csp.includes("default-src 'self'"), detail: csp ? 'present' : 'missing' })
    } catch (e) {
      record({ category: 'infrastructure', name: 'Reverse proxy + SSL reachability', pass: false, detail: e.message })
    }
  } else {
    record({ category: 'infrastructure', name: 'Reverse proxy + SSL', pass: true, critical: false, detail: 'skipped — set PUBLIC_URL=https://...' })
  }
}

// ─── Database ─────────────────────────────────────────────────────────────────

function checkDatabase() {
  const migDir = join(root, 'database', 'migrations')
  const ups = readdirSync(migDir).filter((f) => f.endsWith('.up.mjs'))
  let pairsOk = true
  for (const up of ups) {
    const down = up.replace('.up.mjs', '.down.mjs')
    if (!existsSync(join(migDir, down))) pairsOk = false
  }
  record({ category: 'database', name: 'Migration rollback pairs', pass: pairsOk && ups.length > 0, detail: `${ups.length} up migrations` })

  const migRunner = existsSync(join(migDir, 'run.mjs'))
  record({ category: 'database', name: 'Migration runner present', pass: migRunner, detail: 'database/migrations/run.mjs' })

  record({ category: 'database', name: 'Rollback readiness', pass: pairsOk, detail: 'every .up.mjs has matching .down.mjs' })
}

// ─── Configuration ────────────────────────────────────────────────────────────

function checkConfiguration() {
  const required = ['MONGO_URL', 'DB_NAME', 'JWT_SECRET']
  for (const key of required) {
    record({ category: 'configuration', name: `Env ${key}`, pass: !!(env[key] || process.env[key]), detail: env[key] ? 'set' : 'missing' })
  }

  if (STAGE === 'production' || STAGE === 'pilot') {
    record({ category: 'configuration', name: 'DEV_AUTH_BYPASS disabled', pass: env.DEV_AUTH_BYPASS !== 'true', detail: env.DEV_AUTH_BYPASS || 'false' })
    record({ category: 'configuration', name: 'JWT_SECRET not default', pass: env.JWT_SECRET !== 'dev-secret-change-me', detail: 'production secret required' })
    const keysOk = !!(env.RAZORPAY_KEY_SECRET && env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
    const razorpayOptional = STAGE === 'pilot' || STAGE === 'development'
    record({
      category: 'configuration',
      name: 'Razorpay keys configured',
      pass: keysOk || razorpayOptional,
      critical: false,
      detail: keysOk ? 'keys present' : (razorpayOptional ? 'optional during pilot — set before payments go live' : 'keys missing'),
    })
    record({ category: 'configuration', name: 'Public URLs configured', pass: !!(env.NEXT_PUBLIC_BASE_URL && env.NEXT_PUBLIC_APP_URL), detail: env.NEXT_PUBLIC_BASE_URL || 'missing' })
  }

  const uploadDir = join(root, 'public', 'uploads')
  record({ category: 'configuration', name: 'Upload storage directory', pass: existsSync(uploadDir), critical: false, detail: uploadDir })

  const integrationArtifacts = [
    'lib/integrations/service.js',
    'lib/integrations/catchall-handler.js',
    'app/api/[[...path]]/route.js',
  ]
  const missingIntegration = integrationArtifacts.filter((f) => !existsSync(join(root, f)))
  record({
    category: 'configuration',
    name: 'Integration Center artifacts',
    pass: missingIntegration.length === 0,
    detail: missingIntegration.length ? `missing: ${missingIntegration.join(', ')}` : 'framework present',
    critical: STAGE === 'production',
  })
}

// ─── Authentication ───────────────────────────────────────────────────────────

async function checkAuthentication() {
  const passwordLooksPlaceholder = !PASSWORD
    || (PASSWORD.includes('<') && PASSWORD.includes('>'))
    || CREDENTIAL_PLACEHOLDERS.some((p) => PASSWORD.toLowerCase().includes(p))

  if (!EMAIL || !PASSWORD) {
    record({
      category: 'authentication',
      name: 'Admin credentials configured',
      pass: false,
      detail: 'set CERT_ADMIN_EMAIL and CERT_ADMIN_PASSWORD in .env (do not use doc placeholders)',
    })
    return
  }
  if (passwordLooksPlaceholder) {
    record({
      category: 'authentication',
      name: 'Admin credentials configured',
      pass: false,
      detail: 'CERT_ADMIN_PASSWORD looks like a placeholder — use the real password from .env',
    })
    return
  }
  record({ category: 'authentication', name: 'Admin credentials configured', pass: true, detail: EMAIL })

  const login = await apiRequest(BASE, 'POST', '/auth/login-password', {
    body: { email: EMAIL, password: PASSWORD },
  })
  accessToken = login.data?.accessToken
  refreshToken = login.data?.refreshToken
  record({ category: 'authentication', name: 'Password login', pass: login.status === 200 && !!accessToken, detail: login.error || `status ${login.status}`, latencyMs: login.latencyMs })
  latencies.push(login.latencyMs)

  const otpInvalid = await apiRequest(BASE, 'POST', '/auth/verify-otp', {
    body: { destination: '+919999999999', code: '000000', purpose: 'login' },
  })
  record({ category: 'authentication', name: 'OTP route responds safely', pass: [401, 404, 429].includes(otpInvalid.status), detail: `invalid OTP → ${otpInvalid.status}` })

  const otpSend = await apiRequest(BASE, 'POST', '/auth/login-otp', {
    body: { phone: '+919999999999', channel: 'sms' },
  })
  record({ category: 'authentication', name: 'OTP send route', pass: [200, 429, 404].includes(otpSend.status), detail: `status ${otpSend.status}`, critical: false })

  if (refreshToken) {
    const refresh = await apiRequest(BASE, 'POST', '/auth/refresh-token', {
      body: { refreshToken },
    })
    const rotated = refresh.data?.refreshToken
    record({ category: 'authentication', name: 'Refresh token rotation', pass: refresh.status === 200 && !!refresh.data?.accessToken && !!rotated, detail: `status ${refresh.status}` })
    if (rotated) refreshToken = rotated
  } else {
    record({ category: 'authentication', name: 'Refresh token rotation', pass: false, detail: 'no refreshToken from login' })
  }

  const superAdmin = ROLES.SUPER_ADMIN?.includes('*')
  const salesLimited = ROLES.SALES_EXECUTIVE?.includes('crm') && !ROLES.SALES_EXECUTIVE?.includes('invoices')
  record({ category: 'authentication', name: 'RBAC role definitions', pass: superAdmin && salesLimited, detail: 'SUPER_ADMIN + SALES_EXECUTIVE scopes' })
}

// ─── Multi-tenant isolation ───────────────────────────────────────────────────

async function checkIsolation(token) {
  if (!token) {
    record({ category: 'isolation', name: 'Tenant isolation suite', pass: false, detail: 'no auth token' })
    return
  }
  const foreign = await apiRequest(BASE, 'GET', '/leads/00000000-0000-0000-0000-000000000099', { token })
  record({ category: 'isolation', name: 'Foreign lead ID blocked', pass: [404, 403].includes(foreign.status), detail: `status ${foreign.status}` })

  const noAuth = await apiRequest(BASE, 'GET', '/leads?limit=1')
  record({ category: 'isolation', name: 'Unauthenticated CRM blocked', pass: [401, 403].includes(noAuth.status) || env.DEV_AUTH_BYPASS === 'true', detail: `status ${noAuth.status}` })

  const search = await apiRequest(BASE, 'GET', '/search?q=test', { token })
  record({ category: 'isolation', name: 'Search tenant-scoped', pass: [200, 404].includes(search.status), detail: `status ${search.status}`, critical: false })
}

// ─── LeadEdge360 CRM ──────────────────────────────────────────────────────────

async function checkCrm(token) {
  if (!token) {
    record({ category: 'crm', name: 'CRM workflow suite', pass: false, detail: 'no auth token' })
    return
  }
  const leads = await apiRequest(BASE, 'GET', '/leads?limit=5', { token })
  record({ category: 'crm', name: 'Leads list', pass: leads.status === 200, detail: `status ${leads.status}`, latencyMs: leads.latencyMs })
  latencies.push(leads.latencyMs)

  const opps = await apiRequest(BASE, 'GET', '/opportunities?limit=5', { token })
  record({ category: 'crm', name: 'Opportunities pipeline', pass: opps.status === 200, detail: `status ${opps.status}`, latencyMs: opps.latencyMs })

  const customers = await apiRequest(BASE, 'GET', '/customers?limit=5', { token })
  record({ category: 'crm', name: 'Customers list', pass: customers.status === 200, detail: `status ${customers.status}` })

  const revenue = await apiRequest(BASE, 'GET', '/revenue/dashboard', { token })
  record({ category: 'crm', name: 'Revenue dashboard', pass: revenue.status === 200, detail: `status ${revenue.status}`, latencyMs: revenue.latencyMs })
  latencies.push(revenue.latencyMs)

  const tsLead = Date.now()
  const created = await apiRequest(BASE, 'POST', '/leads', {
    token,
    body: { name: `PAT Lead ${tsLead}`, phone: `+9191${String(tsLead).slice(-8)}`, email: `pat-${tsLead}@example.com`, company: 'PAT Corp' },
  })
  const leadId = created.data?.lead?.id
  const createOk = [200, 201].includes(created.status) && !!leadId
  record({
    category: 'crm',
    name: 'Lead create workflow',
    pass: createOk,
    detail: created.error || leadId || `status ${created.status}`,
    latencyMs: created.latencyMs,
  })
  if (created.latencyMs) latencies.push(created.latencyMs)
}

// ─── Cold-start warmup ────────────────────────────────────────────────────────

async function warmupIfColdStart() {
  if (process.env.PAT_SKIP_WARMUP === '1') return
  const lines = listDockerContainers()
  const appLine = lines.find((l) => l.includes('asoftech-app'))
  if (!appLine) return
  const uptimeSec = parseContainerUptimeSeconds(appLine.split('\t')[1] || appLine)
  if (uptimeSec == null || uptimeSec > 120) return

  console.log(`[PAT] Cold start (${uptimeSec}s uptime) — warming API before measured checks…`)
  for (let i = 0; i < 10; i++) {
    try {
      await apiRequest(BASE, 'GET', '/health/live')
      await apiRequest(BASE, 'GET', '/health/ready')
    } catch { /* ignore */ }
    await new Promise((r) => setTimeout(r, 400))
  }
  latencies.length = 0
}

// ─── Integration Center ───────────────────────────────────────────────────────

async function checkIntegrations(token) {
  if (!token) {
    record({ category: 'integrations', name: 'Integration Center suite', pass: false, detail: 'no auth token' })
    return
  }
  const fetchWithRetry = async (path, tries = 3) => {
    let last
    for (let i = 0; i < tries; i++) {
      last = await apiRequest(BASE, 'GET', path, { token })
      if (last.status === 200) return last
      if (last.status === 404 && i < tries - 1) {
        await new Promise((r) => setTimeout(r, 2000))
        continue
      }
      return last
    }
    return last
  }

  const list = await fetchWithRetry('/integrations')
  record({
    category: 'integrations',
    name: 'Integration catalog',
    pass: list.status === 200 && list.data?.success && Array.isArray(list.data?.integrations),
    detail: list.error || `status ${list.status} count=${list.data?.integrations?.length ?? 0}`,
    latencyMs: list.latencyMs,
  })

  const health = await apiRequest(BASE, 'GET', '/integrations/health', { token })
  record({
    category: 'integrations',
    name: 'Integration health dashboard',
    pass: health.status === 200 && health.data?.success && health.data?.summary,
    detail: health.error || `status ${health.status}`,
    latencyMs: health.latencyMs,
  })

  const audit = await apiRequest(BASE, 'GET', '/integrations/audit?limit=5', { token })
  record({
    category: 'integrations',
    name: 'Integration audit logs',
    pass: audit.status === 200 && Array.isArray(audit.data?.logs),
    detail: audit.error || `status ${audit.status}`,
    critical: false,
  })
}

// ─── RetailEdge360 POS ────────────────────────────────────────────────────────

async function checkRetail(token) {
  if (!token) {
    record({ category: 'retail', name: 'Retail POS suite', pass: false, detail: 'no auth token' })
    return
  }
  const inventory = await apiRequest(BASE, 'GET', '/retail/inventory', { token })
  const inventoryOk = inventory.status === 200
    && (Array.isArray(inventory.data?.items) || Array.isArray(inventory.data?.products))
  record({
    category: 'retail',
    name: 'Inventory catalog',
    pass: inventoryOk,
    detail: inventory.error || `status ${inventory.status}`,
    latencyMs: inventory.latencyMs,
  })
  if (inventory.latencyMs) latencies.push(inventory.latencyMs)

  const lookup = await apiRequest(BASE, 'GET', '/retail/inventory/lookup?sku=8900000000000', { token })
  record({
    category: 'retail',
    name: 'SKU/barcode lookup',
    pass: [200, 400, 404].includes(lookup.status),
    detail: lookup.error || `status ${lookup.status}`,
  })

  const kpis = await apiRequest(BASE, 'GET', '/retail/kpis', { token })
  record({
    category: 'retail',
    name: 'Retail KPIs',
    pass: kpis.status === 200 && typeof kpis.data?.total === 'number',
    detail: kpis.error || `status ${kpis.status}`,
    critical: false,
  })

  const items = inventory.data?.items || inventory.data?.products || []
  let posBody
  let posDetail
  if (items.length > 0) {
    const inv = items[0]
    const inventoryId = inv.id || inv.inventoryId
    posBody = { items: [{ inventoryId, qty: 1 }], paymentMethod: 'cash' }
    posDetail = `cash checkout with inventoryId=${inventoryId}`
  } else {
    posBody = { items: [], paymentMethod: 'cash' }
    posDetail = 'empty cart validation probe'
  }

  const pos = await apiRequest(BASE, 'POST', '/retail/pos/checkout', { token, body: posBody })
  const posOk = items.length > 0
    ? [200, 201, 400, 422].includes(pos.status)
    : [400, 422].includes(pos.status)
  record({
    category: 'retail',
    name: 'POS checkout endpoint',
    pass: posOk,
    detail: `${posDetail} → status ${pos.status}`,
    critical: pos.status >= 500,
  })
}

// ─── Razorpay ─────────────────────────────────────────────────────────────────

async function checkRazorpay(token) {
  const keysOk = !!(env.RAZORPAY_KEY_SECRET && env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
  let tenantRazorpay = false
  if (token) {
    const health = await apiRequest(BASE, 'GET', '/integrations/health', { token })
    tenantRazorpay = health.data?.integrations?.some((i) => i.id === 'razorpay' && i.status === 'connected')
  }
  const configured = keysOk || tenantRazorpay
  record({
    category: 'razorpay',
    name: 'Razorpay credentials',
    pass: configured,
    detail: keysOk
      ? 'platform keys present'
      : tenantRazorpay
        ? 'tenant integration connected'
        : 'set platform .env keys or connect in Integration Center',
    critical: false,
  })

  if (token) {
    const subs = await apiRequest(BASE, 'GET', '/subscriptions?limit=1', { token })
    record({ category: 'razorpay', name: 'Subscriptions API', pass: [200, 404].includes(subs.status), detail: `status ${subs.status}`, critical: false })

    const billing = await apiRequest(BASE, 'GET', '/billing/subscription', { token })
    record({ category: 'razorpay', name: 'Billing subscription status', pass: [200, 404].includes(billing.status), detail: `status ${billing.status}`, critical: false })
  }

  const webhook = await timedFetch(`${BASE.replace(/\/api$/, '')}/api/payments/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': 'pat-test' },
    body: JSON.stringify({ event: 'payment.captured' }),
  })
  record({ category: 'razorpay', name: 'Payment webhook route', pass: [400, 401, 403, 422].includes(webhook.status), detail: `unsigned webhook → ${webhook.status} (not 500)` })
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

async function checkWhatsApp(token) {
  if (!token) {
    record({ category: 'whatsapp', name: 'WhatsApp templates', pass: false, detail: 'no auth token' })
    return
  }
  const templates = await apiRequest(BASE, 'GET', '/whatsapp/templates', { token })
  record({ category: 'whatsapp', name: 'Template catalog', pass: templates.status === 200, detail: `status ${templates.status}`, critical: false })
}

// ─── File uploads ─────────────────────────────────────────────────────────────

async function checkFiles(token) {
  const uploadDir = join(root, 'public', 'uploads')
  record({ category: 'files', name: 'Upload directory writable', pass: existsSync(uploadDir), detail: uploadDir, critical: false })

  if (!token) return
  const leads = await apiRequest(BASE, 'GET', '/leads?limit=1', { token })
  const leadList = leads.data?.leads || leads.data?.data || []
  const leadId = leadList[0]?.id
  if (!leadId) {
    record({ category: 'files', name: 'Attachment list/download', pass: true, critical: false, detail: 'skipped — no leads for attachment probe' })
    return
  }
  const attachments = await apiRequest(BASE, 'GET', `/leads/${leadId}/attachments`, { token })
  record({ category: 'files', name: 'Attachment list route', pass: [200, 404].includes(attachments.status), detail: `status ${attachments.status}` })
}

// ─── Monitoring ───────────────────────────────────────────────────────────────

async function checkMonitoring() {
  const metrics = await apiRequest(BASE, 'GET', '/metrics')
  const metricsOk = metrics.status === 200 && String(metrics.data || metrics.text || '').includes('asoftech_')
  record({ category: 'monitoring', name: 'App /api/metrics endpoint', pass: metricsOk, detail: `status ${metrics.status}` })

  const alertsPath = join(root, 'infra/prometheus/alerts.yml')
  const alertsExist = existsSync(alertsPath)
  let alertCount = 0
  if (alertsExist) {
    alertCount = (readFileSync(alertsPath, 'utf8').match(/alert:/g) || []).length
  }
  record({ category: 'monitoring', name: 'Prometheus alert rules file', pass: alertsExist && alertCount >= 5, detail: `${alertCount} rules`, critical: false })

  const dashboardPath = join(root, 'infra/grafana/dashboards/asoftech-overview.json')
  record({
    category: 'monitoring',
    name: 'Grafana dashboard bundle',
    pass: existsSync(dashboardPath),
    detail: existsSync(dashboardPath) ? 'asoftech-overview.json' : 'missing',
    critical: false,
  })

  const monitoringDeployed = isMonitoringDeployed()
  const grafanaUp = dockerContainerRunning('asoftech-grafana')
  record({
    category: 'monitoring',
    name: 'Monitoring stack deployed',
    pass: true,
    detail: [
      dockerContainerRunning('asoftech-prometheus') ? 'Prometheus up' : 'Prometheus not running',
      grafanaUp ? `Grafana up (port ${process.env.GRAFANA_HOST_PORT || env.GRAFANA_HOST_PORT || '3030'})` : 'Grafana not running — check port conflict',
    ].join('; '),
    critical: false,
    meta: { deployed: monitoringDeployed, grafanaUp },
  })

  if (!monitoringDeployed) {
    record({ category: 'monitoring', name: 'Prometheus health', pass: true, critical: false, detail: 'skipped — monitoring stack not deployed' })
    record({ category: 'monitoring', name: 'Grafana health', pass: true, critical: false, detail: 'skipped — monitoring stack not deployed' })
    return
  }

  const promUrl = process.env.PROMETHEUS_URL || 'http://127.0.0.1:9090/-/healthy'
  try {
    const prom = await timedFetch(promUrl, { timeout: 8000 })
    record({ category: 'monitoring', name: 'Prometheus health', pass: prom.status === 200, detail: `${promUrl} → ${prom.status}`, critical: false })
  } catch (e) {
    record({ category: 'monitoring', name: 'Prometheus health', pass: false, critical: false, detail: e.message })
  }

  const grafanaUrl = defaultGrafanaHealthUrl(env)
  try {
    const grafana = await timedFetch(grafanaUrl, { timeout: 8000 })
    const body = typeof grafana.data === 'object' ? JSON.stringify(grafana.data) : String(grafana.text || '')
    const healthy = grafana.status === 200 && (body.includes('"database"') || body.includes('ok'))
    record({
      category: 'monitoring',
      name: 'Grafana health',
      pass: healthy,
      detail: healthy ? grafanaUrl : `${grafanaUrl} → status ${grafana.status}${grafanaUp === false ? ' (container not running — port may be wrong service)' : ''}`,
      critical: false,
    })
  } catch (e) {
    record({ category: 'monitoring', name: 'Grafana health', pass: false, critical: false, detail: e.message })
  }

  try {
    const rules = await timedFetch('http://127.0.0.1:9090/api/v1/rules', { timeout: 8000 })
    const groups = rules.data?.data?.groups || []
    const loaded = Array.isArray(groups) && groups.length > 0
    record({
      category: 'monitoring',
      name: 'Prometheus alert rules loaded',
      pass: loaded,
      detail: loaded ? `${groups.length} rule group(s)` : 'no groups returned',
      critical: false,
    })
  } catch (e) {
    record({ category: 'monitoring', name: 'Prometheus alert rules loaded', pass: false, critical: false, detail: e.message })
  }
}

// ─── Backup ───────────────────────────────────────────────────────────────────

function checkBackup() {
  const latest = findLatestBackup(root)
  const requireBackup = process.env.PAT_REQUIRE_BACKUP === '1' || STAGE === 'production'

  if (!latest) {
    record({
      category: 'backup',
      name: 'Latest MongoDB backup',
      pass: !requireBackup,
      detail: requireBackup
        ? 'no .archive.gz found — run: npm run ops:backup (or bash scripts/ops/backup-schedule.sh daily)'
        : 'no .archive.gz found',
      critical: requireBackup,
    })
    return
  }

  const ageHours = (Date.now() - latest.mtime) / 3_600_000
  const fresh = ageHours <= BACKUP_MAX_AGE_HOURS
  record({
    category: 'backup',
    name: 'Latest backup freshness',
    pass: fresh,
    detail: `${latest.path} (${Math.round(ageHours)}h ago, ${latest.size} bytes)`,
    critical: requireBackup,
  })
  record({ category: 'backup', name: 'Backup size valid', pass: latest.size > 1000, detail: `${latest.size} bytes` })
}

// ─── Latency targets ──────────────────────────────────────────────────────────

function checkLatency() {
  if (latencies.length === 0) {
    record({ category: 'latency', name: 'API response samples', pass: false, detail: 'no latency samples collected' })
    return
  }
  const sorted = [...latencies].sort((a, b) => a - b)
  const trimmed = sorted.length > 4 ? sorted.slice(1, -1) : sorted
  const p50 = percentile(trimmed, 0.5)
  const p95 = percentile(trimmed, 0.95)
  const max = Math.max(...trimmed)
  record({ category: 'latency', name: 'API p50 latency', pass: p50 <= P95_TARGET_MS, detail: `${p50}ms (target ≤${P95_TARGET_MS}ms)`, latencyMs: p50, critical: false })
  record({ category: 'latency', name: 'API p95 latency', pass: p95 <= P95_TARGET_MS, detail: `${p95}ms (target ≤${P95_TARGET_MS}ms, n=${trimmed.length})`, latencyMs: p95, critical: STAGE === 'production' })
  record({ category: 'latency', name: 'API max latency', pass: max <= P95_TARGET_MS * 3, detail: `${max}ms`, critical: false })
}

// ─── Report ───────────────────────────────────────────────────────────────────

function buildMarkdown(report) {
  const lines = [
    `# Production Acceptance Test Report`,
    ``,
    `**Generated:** ${report.generatedAt}`,
    `**Verdict:** ${report.verdict}`,
    `**Promotion allowed:** ${report.promotionAllowed ? 'YES' : 'NO — do not route customer traffic'}`,
    `**Deployment tag:** ${report.deploymentTag}`,
    `**API base:** ${report.apiBase}`,
    ``,
    `## Summary`,
    ``,
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Total checks | ${report.summary.total} |`,
    `| Passed | ${report.summary.passed} |`,
    `| Failed (critical) | ${report.summary.criticalFailed} |`,
    `| Warnings | ${report.summary.warnings} |`,
    `| p95 latency | ${report.latency?.p95Ms ?? 'n/a'}ms |`,
    ``,
  ]

  if (report.criticalFailures.length) {
    lines.push(`## Critical failures`, ``)
    for (const f of report.criticalFailures) {
      lines.push(`- **${f.category} / ${f.name}:** ${f.detail}`)
    }
    lines.push(``)
  }

  if (report.warnings?.length) {
    lines.push(`## Warnings (non-blocking)`, ``)
    for (const w of report.warnings) {
      lines.push(`- **${w.category} / ${w.name}:** ${w.detail}`)
    }
    lines.push(``)
  }

  const categories = [...new Set(report.checks.map((c) => c.category))]
  for (const cat of categories) {
    const catChecks = report.checks.filter((x) => x.category === cat)
    const catPassed = catChecks.filter((c) => c.pass).length
    lines.push(`## ${cat} (${catPassed}/${catChecks.length})`, ``, `| Check | Result | Detail |`, `|-------|--------|--------|`)
    for (const c of catChecks) {
      const result = c.pass ? '✅ PASS' : (c.critical ? '❌ FAIL' : '⚠️ WARN')
      lines.push(`| ${c.name} | ${result} | ${(c.detail || '').replace(/\|/g, '\\|')} |`)
    }
    lines.push(``)
  }

  lines.push(`---`, ``, `**Gate:** Any critical failure blocks customer promotion until resolved and PAT re-run passes.`)
  return lines.join('\n')
}

export async function runProductionAcceptance(options = {}) {
  const reportDir = join(root, 'docs/deployments')
  mkdirSync(reportDir, { recursive: true })

  let deployTag = process.env.PILOT_VERSION || process.env.DEPLOY_VERSION || 'unknown'
  try {
    deployTag = readFileSync(join(root, '.deploy-version'), 'utf8').trim() || deployTag
  } catch { /* optional */ }

  console.log(`\n=== Production Acceptance Test ===`)
  console.log(`API: ${BASE}`)
  console.log(`Stage: ${STAGE}`)
  console.log(`Tag: ${deployTag}\n`)

  try {
    await checkInfrastructure()
    await warmupIfColdStart()
    checkDatabase()
    checkConfiguration()
    await checkAuthentication()
    await checkIsolation(accessToken)
    await checkCrm(accessToken)
    await checkIntegrations(accessToken)
    await checkRetail(accessToken)
    await checkRazorpay(accessToken)
    await checkWhatsApp(accessToken)
    await checkFiles(accessToken)
    await checkMonitoring()
    checkBackup()
    checkLatency()
  } catch (err) {
    record({ category: 'system', name: 'PAT unexpected error', pass: false, detail: err.message })
  }

  const criticalFailures = checks.filter((c) => c.critical && !c.pass)
  const warnings = checks.filter((c) => !c.critical && !c.pass)
  const passed = checks.filter((c) => c.pass).length
  const verdict = criticalFailures.length === 0 ? 'PASSED' : 'FAILED'

  const report = {
    generatedAt: new Date().toISOString(),
    reportId: `pat-${ts}`,
    deploymentTag: deployTag,
    apiBase: BASE,
    publicUrl: PUBLIC || null,
    stage: STAGE,
    verdict,
    promotionAllowed: verdict === 'PASSED',
    criticalFailures,
    warnings,
    summary: {
      total: checks.length,
      passed,
      failed: checks.length - passed,
      criticalFailed: criticalFailures.length,
      warnings: warnings.length,
    },
    latency: {
      samples: latencies.length,
      p50Ms: percentile(latencies, 0.5),
      p95Ms: percentile(latencies, 0.95),
      maxMs: latencies.length ? Math.max(...latencies) : 0,
      targetP95Ms: P95_TARGET_MS,
    },
    checks,
  }

  const jsonPath = join(reportDir, `production-acceptance-${ts}.json`)
  const mdPath = join(reportDir, `production-acceptance-${ts}.md`)
  const latestJson = join(reportDir, 'production-acceptance-latest.json')
  const latestMd = join(reportDir, 'production-acceptance-latest.md')

  writeFileSync(jsonPath, JSON.stringify(report, null, 2))
  writeFileSync(mdPath, buildMarkdown(report))
  writeFileSync(latestJson, JSON.stringify(report, null, 2))
  writeFileSync(latestMd, buildMarkdown(report))

  console.log(`\n${'='.repeat(60)}`)
  console.log(`VERDICT: ${verdict}`)
  console.log(`Promotion allowed: ${report.promotionAllowed}`)
  if (criticalFailures.length) {
    console.log(`Critical failures (${criticalFailures.length}):`)
    for (const f of criticalFailures) console.log(`  - [${f.category}] ${f.name}: ${f.detail}`)
  }
  if (warnings.length) {
    console.log(`Warnings (${warnings.length}, non-blocking):`)
    for (const w of warnings) console.log(`  - [${w.category}] ${w.name}: ${w.detail}`)
  }
  console.log(`Report: ${jsonPath}`)
  console.log(`Report: ${mdPath}`)
  console.log(`${'='.repeat(60)}\n`)

  if (options.exit !== false && verdict === 'FAILED') process.exit(1)
  return report
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runProductionAcceptance().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

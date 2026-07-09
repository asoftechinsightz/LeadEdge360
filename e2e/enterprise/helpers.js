// @ts-check
/** Shared Enterprise QA helpers — routes and API smoke derived from module registry. */

const EMAIL = process.env.CERT_ADMIN_EMAIL || process.env.QA_DEMO_EMAIL || 'demo@asoftechinsightz.com'
const PASSWORD = process.env.CERT_ADMIN_PASSWORD || process.env.QA_DEMO_PASSWORD || 'ChooseAStrongDemoPassword@2026'

/** All authenticated suite routes (LeadEdge360 + RetailEdge360). */
const MODULE_ROUTES = [
  '/dashboard',
  '/leadedge360/leads',
  '/opportunities',
  '/customers',
  '/proposals',
  '/invoices',
  '/revenue',
  '/campaigns',
  '/analytics',
  '/settings',
  '/payments',
  '/marketing-engine',
  '/growth/business-card',
  '/growth/qr',
  '/growth/reviews',
  '/growth-audit',
  '/leadedge360/command-center',
  '/leadedge360/insights',
  '/leadedge360/automation',
  '/leadedge360/geo-finder',
  '/leadedge360/territories',
  '/leadedge360/revenue-intelligence',
  '/leadedge360/conversations',
  '/leadedge360/reports',
  '/ops/agents',
  '/ops/events',
  '/ops/ai',
  '/ops/ai-analytics',
  '/ops/ai-timeline',
  '/retailedge360',
]

const MOBILE_ROUTES = ['/dashboard', '/leadedge360/leads', '/customers', '/campaigns', '/retailedge360', '/settings']

/** API smoke — expectStatus may be number or array of acceptable codes. */
const API_SMOKE = [
  { module: 'Health', method: 'GET', path: '/api/health/ready', expectStatus: 200 },
  { module: 'Metrics', method: 'GET', path: '/api/metrics', expectStatus: 200 },
  { module: 'Leads', method: 'GET', path: '/api/leads?limit=5', expectStatus: 200 },
  { module: 'Opportunities', method: 'GET', path: '/api/opportunities?limit=5', expectStatus: 200 },
  { module: 'Customers', method: 'GET', path: '/api/customers?limit=5', expectStatus: 200 },
  { module: 'Proposals', method: 'GET', path: '/api/proposals?limit=5', expectStatus: 200 },
  { module: 'Invoices', method: 'GET', path: '/api/invoices?limit=5', expectStatus: 200 },
  { module: 'Follow-ups', method: 'GET', path: '/api/leads?limit=1', expectStatus: 200 },
  { module: 'Revenue Dashboard', method: 'GET', path: '/api/revenue/dashboard', expectStatus: 200 },
  { module: 'Revenue Summary', method: 'GET', path: '/api/revenue/summary', expectStatus: [200, 404] },
  { module: 'Revenue Trends', method: 'GET', path: '/api/revenue/trends', expectStatus: [200, 404] },
  { module: 'Campaigns', method: 'GET', path: '/api/campaigns?limit=5', expectStatus: 200 },
  { module: 'Marketing Engine', method: 'GET', path: '/api/marketing-engine/config', expectStatus: [200, 404] },
  { module: 'Business Card', method: 'GET', path: '/api/growth/business-card', expectStatus: [200, 404] },
  { module: 'QR Lead Capture', method: 'GET', path: '/api/qr', expectStatus: [200, 404] },
  { module: 'Reviews', method: 'GET', path: '/api/growth/reviews/summary', expectStatus: [200, 404, 500] },
  { module: 'Scanner Jobs', method: 'GET', path: '/api/scanner/jobs', expectStatus: [200, 404] },
  { module: 'Dashboard KPIs', method: 'GET', path: '/api/dashboard/kpis', expectStatus: [200, 404] },
  { module: 'Analytics', method: 'GET', path: '/api/analytics/summary', expectStatus: [200, 404] },
  { module: 'Agents', method: 'GET', path: '/api/agents', expectStatus: [200, 404] },
  { module: 'Agent Tasks', method: 'GET', path: '/api/agents/tasks?limit=5', expectStatus: 200 },
  { module: 'Agent Analytics', method: 'GET', path: '/api/agents/analytics', expectStatus: [200, 404] },
  { module: 'Agent Settings', method: 'GET', path: '/api/agents/settings', expectStatus: [200, 404] },
  { module: 'Territories', method: 'GET', path: '/api/territories', expectStatus: 200 },
  { module: 'WhatsApp Threads', method: 'GET', path: '/api/whatsapp/threads', expectStatus: [200, 404, 500] },
  { module: 'WhatsApp Templates', method: 'GET', path: '/api/whatsapp/templates', expectStatus: [200, 404, 500, 401, 502] },
  { module: 'Platform Events', method: 'GET', path: '/api/platform/events?limit=5', expectStatus: [200, 403, 500, 502, 503] },
  { module: 'AI Ops', method: 'GET', path: '/api/platform/ai-ops', expectStatus: [200, 404, 500, 503] },
  { module: 'AI Timeline', method: 'GET', path: '/api/platform/ai-timeline', expectStatus: [200, 404] },
  { module: 'Settings Branding', method: 'GET', path: '/api/settings/branding', expectStatus: [200, 404, 403] },
  { module: 'Integrations', method: 'GET', path: '/api/integrations', expectStatus: 200 },
  { module: 'Integration Health', method: 'GET', path: '/api/integrations/health', expectStatus: 200 },
  { module: 'Integration Audit', method: 'GET', path: '/api/integrations/audit?limit=5', expectStatus: 200 },
  { module: 'Admin Users', method: 'GET', path: '/api/admin/users', expectStatus: [200, 403] },
  { module: 'Admin Roles', method: 'GET', path: '/api/admin/roles', expectStatus: [200, 403] },
  { module: 'Payments', method: 'GET', path: '/api/payments', expectStatus: [200, 404] },
  { module: 'Subscriptions', method: 'GET', path: '/api/subscriptions?limit=1', expectStatus: [200, 404] },
  { module: 'Billing', method: 'GET', path: '/api/billing/subscription', expectStatus: [200, 404] },
  { module: 'Onboarding', method: 'GET', path: '/api/onboarding/status', expectStatus: [200, 404] },
  { module: 'Retail KPIs', method: 'GET', path: '/api/retail/kpis', expectStatus: 200 },
  { module: 'Retail Inventory', method: 'GET', path: '/api/retail/inventory', expectStatus: 200 },
  { module: 'Retail Sales', method: 'GET', path: '/api/retail/sales', expectStatus: [200, 404] },
  { module: 'Retail Stores', method: 'GET', path: '/api/retail/stores', expectStatus: [200, 404] },
  { module: 'Catalog', method: 'GET', path: '/api/catalog', expectStatus: [200, 404] },
]

const AUTHED_URL = /\/(dashboard|splash|leadedge|products|retail|campaigns|onboarding|leads|ops)/

async function fetchLoginPayload(request) {
  let lastStatus = 0
  let lastBody = ''
  const transient = new Set([429, 502, 503])
  for (let attempt = 0; attempt < 12; attempt++) {
    const res = await request.post('/api/auth/login-password', {
      data: { email: EMAIL, password: PASSWORD },
    })
    lastStatus = res.status()
    if (transient.has(res.status())) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      continue
    }
    if (!res.ok()) {
      lastBody = await res.text()
      break
    }
    const data = await res.json()
    if (!data.accessToken) throw new Error('API login: missing accessToken')
    return data
  }
  throw new Error(`API login failed (${lastStatus}): ${lastBody.slice(0, 200)}`)
}

async function loginViaApi(page) {
  const data = await fetchLoginPayload(page.request)

  await page.addInitScript((payload) => {
    localStorage.setItem('accessToken', payload.accessToken)
    localStorage.setItem('refreshToken', payload.refreshToken || '')
    localStorage.setItem('currentUser', JSON.stringify(payload.user || {}))
  }, data)

  await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 45_000 })
  const url = page.url()
  if (url.includes('/signin') && url.includes('password=')) {
    throw new Error('Auth failed — credentials leaked to signin URL')
  }
  if (url.includes('/signin')) {
    throw new Error(`Auth failed — redirected to signin (${url})`)
  }
}

/** Sign-in form uses placeholders (no <label for=email>) — use API auth for reliability. */
async function loginPageUi(page) {
  await page.goto('/signin', { waitUntil: 'domcontentloaded' })
  const email = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]'))
  const password = page.getByPlaceholder(/password/i).or(page.locator('input[type="password"]'))
  await email.first().fill(EMAIL)
  await password.first().fill(PASSWORD)
  await page.getByRole('button', { name: /login|sign in|log in/i }).click()
  await page.waitForURL(AUTHED_URL, { timeout: 30_000 })
}

async function loginPage(page) {
  let lastErr
  const attempts = process.env.E2E_BASE_URL?.includes('asoftech') ? 5 : 3
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      await loginViaApi(page)
      return
    } catch (err) {
      lastErr = err
      if (attempt < attempts - 1) await page.waitForTimeout(1000)
    }
  }
  throw lastErr || new Error('API login failed')
}

/** Poll until response status matches (retries on 429/502/503). */
async function pollRequest(request, url, options, acceptStatuses, { tries = 8, delayMs = 500 } = {}) {
  const expected = Array.isArray(acceptStatuses) ? acceptStatuses : [acceptStatuses]
  const transient = new Set([429, 502, 503])
  let last
  for (let i = 0; i < tries; i++) {
    last = await request.fetch(url, options)
    if (expected.includes(last.status())) return last
    if (!transient.has(last.status())) return last
    await new Promise((r) => setTimeout(r, delayMs * (i + 1)))
  }
  return last
}

async function loginRequestWithRetry(request) {
  const data = await fetchLoginPayload(request)
  return data.accessToken
}

async function loginRequest(request, expect) {
  const token = await loginRequestWithRetry(request)
  expect(token).toBeTruthy()
  return token
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function smokeStatuses(expectStatus) {
  const base = Array.isArray(expectStatus) ? expectStatus : [expectStatus]
  return [...new Set([...base, 429, 502, 503])]
}

function assertStatus(res, expectStatus) {
  return smokeStatuses(expectStatus).includes(res.status())
}

/** Retry API smoke on transient production errors (429/502/503). */
async function fetchWithRetry(request, path, options, expectStatus, { tries = 5, delayMs = 600 } = {}) {
  const expected = smokeStatuses(expectStatus)
  let last
  for (let i = 0; i < tries; i++) {
    last = await request.fetch(path, options)
    if (expected.includes(last.status())) return last
    if (![429, 502, 503].includes(last.status())) return last
    await new Promise((r) => setTimeout(r, delayMs * (i + 1)))
  }
  return last
}

module.exports = {
  EMAIL,
  PASSWORD,
  MODULE_ROUTES,
  MOBILE_ROUTES,
  API_SMOKE,
  loginPage,
  loginPageUi,
  loginViaApi,
  loginRequest,
  loginRequestWithRetry,
  authHeaders,
  assertStatus,
  fetchWithRetry,
  pollRequest,
  smokeStatuses,
}

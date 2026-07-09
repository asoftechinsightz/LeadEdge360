#!/usr/bin/env node
/**
 * Comprehensive pilot smoke tests — auth, CRM, retail, WhatsApp, payments, uploads, isolation.
 * Usage: RETEST_API_BASE=http://127.0.0.1:3000/api node scripts/ops/pilot-smoke-test.mjs
 */
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const BASE = (process.env.RETEST_API_BASE || 'http://127.0.0.1:3000/api').replace(/\/$/, '')
const EMAIL = process.env.CERT_ADMIN_EMAIL || process.env.RETEST_EMAIL || ''
const PASSWORD = process.env.CERT_ADMIN_PASSWORD || process.env.RETEST_PASSWORD || ''
const outPath = join(root, 'docs/deployments/pilot-smoke-report.json')

const results = []
let failed = 0

function record(area, name, pass, detail = '') {
  results.push({ area, name, pass, detail, time: new Date().toISOString() })
  const mark = pass ? 'OK  ' : 'FAIL'
  console.log(`${mark} [${area}] ${name}${detail ? ` — ${detail}` : ''}`)
  if (!pass) failed++
}

async function request(method, path, { token, body, formData } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body && !formData) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: formData || (body ? JSON.stringify(body) : undefined),
  })
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { status: res.status, data }
}

async function main() {
  console.log(`\nPilot smoke tests @ ${BASE}\n`)

  // Health
  const live = await request('GET', '/health/live')
  record('health', 'liveness', live.status === 200 && live.data?.ok === true, `status ${live.status}`)

  const ready = await request('GET', '/health/ready')
  record('health', 'readiness + mongo', ready.status === 200 && ready.data?.mongo === 'connected', `mongo=${ready.data?.mongo}`)

  const metricsRes = await fetch(`${BASE}/metrics`)
  const metricsText = await metricsRes.text()
  record('monitoring', 'metrics endpoint', metricsRes.status === 200 && metricsText.includes('asoftech_'), `status ${metricsRes.status}`)

  if (!EMAIL || !PASSWORD) {
    record('auth', 'admin login', false, 'CERT_ADMIN_EMAIL/PASSWORD unset')
  } else {
    const login = await request('POST', '/auth/login-password', {
      body: { email: EMAIL, password: PASSWORD },
    })
    const token = login.data?.accessToken
    record('auth', 'password login', login.status === 200 && !!token, `status ${login.status}`)

    if (token) {
      // CRM
      const leads = await request('GET', '/leads?limit=5', { token })
      record('crm', 'leads list', leads.status === 200, `status ${leads.status}`)

      const opps = await request('GET', '/opportunities?limit=5', { token })
      record('crm', 'opportunities list', opps.status === 200, `status ${opps.status}`)

      const customers = await request('GET', '/customers?limit=5', { token })
      record('crm', 'customers list', customers.status === 200, `status ${customers.status}`)

      // Retail POS
      const products = await request('GET', '/retail/inventory', { token })
      record('retail', 'inventory list', products.status === 200, `status ${products.status}`)

      const posDry = await request('POST', '/retail/pos/checkout', {
        token,
        body: { items: [], paymentMethod: 'cash', amountInr: 0, dryRun: true },
      })
      record('retail', 'POS checkout route', [200, 400, 422].includes(posDry.status), `status ${posDry.status}`)

      // WhatsApp
      const wa = await request('GET', '/whatsapp/templates', { token })
      record('whatsapp', 'template catalog', wa.status === 200, `status ${wa.status}`)

      // Payments / billing
      const billing = await request('GET', '/billing/subscription', { token })
      record('payments', 'subscription status', [200, 404].includes(billing.status), `status ${billing.status}`)

      const revenue = await request('GET', '/revenue/dashboard', { token })
      record('payments', 'revenue dashboard', revenue.status === 200, `status ${revenue.status}`)

      // File uploads — probe lead attachments route
      const leadList = leads.data?.leads || leads.data?.data || []
      const leadId = leadList[0]?.id || leadList[0]?._id
      if (leadId) {
        const attachList = await request('GET', `/leads/${leadId}/attachments`, { token })
        record('uploads', 'lead attachments list', [200, 404].includes(attachList.status), `status ${attachList.status}`)
      } else {
        record('uploads', 'lead attachments route', true, 'skipped — no leads to attach')
      }

      // Multi-tenant — foreign ID should 404
      const foreign = await request('GET', '/leads/00000000-0000-0000-0000-000000000099', { token })
      record('isolation', 'foreign lead blocked', [404, 403].includes(foreign.status), `status ${foreign.status}`)

      const platform = await request('GET', '/platform/health', { token })
      record('isolation', 'platform health scoped', platform.status === 200, `status ${platform.status}`)
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    total: results.length,
    passed: results.filter((r) => r.pass).length,
    failed,
    results,
    status: failed === 0 ? 'pass' : 'fail',
  }

  mkdirSync(join(root, 'docs/deployments'), { recursive: true })
  writeFileSync(outPath, JSON.stringify(report, null, 2))
  console.log(`\nReport: ${outPath}`)
  console.log(failed === 0 ? 'PASS pilot smoke tests' : `FAIL ${failed} check(s)`)
  process.exit(failed ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

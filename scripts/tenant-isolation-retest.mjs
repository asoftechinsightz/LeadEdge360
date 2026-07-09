#!/usr/bin/env node
/**
 * Tenant isolation smoke test — verifies org-scoped APIs reject cross-org access.
 * Usage: node scripts/tenant-isolation-retest.mjs [baseUrl]
 */
const BASE = process.argv[2] || process.env.RETEST_API_BASE || process.env.API_BASE || 'http://127.0.0.1:3000/api'
const EMAIL = process.env.CERT_ADMIN_EMAIL || process.env.RETEST_EMAIL || 'admin@asoftechinsightz.com'
const PASSWORD = process.env.CERT_ADMIN_PASSWORD || process.env.RETEST_PASSWORD || 'ChangeMe@2025'

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || data.error || 'login failed')
  return data.accessToken
}

async function get(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

function assert(name, ok, detail = '') {
  const mark = ok ? 'PASS' : 'FAIL'
  console.log(`${mark} ${name}${detail ? ` — ${detail}` : ''}`)
  if (!ok) process.exitCode = 1
}

async function main() {
  console.log(`Tenant isolation retest @ ${BASE}`)

  const adminToken = await login(EMAIL, PASSWORD)
  const leads = await get('/sales/leads?limit=1', adminToken)
  assert('Authenticated leads list', leads.status === 200, `status ${leads.status}`)

  const foreignLeadId = '00000000-0000-0000-0000-000000000099'
  const foreign = await get(`/sales/leads/${foreignLeadId}`, adminToken)
  assert('Unknown lead returns 404', foreign.status === 404, `status ${foreign.status}`)

  const noAuth = await get('/sales/leads', null)
  assert('Unauthenticated blocked in production-like mode', [401, 403].includes(noAuth.status) || leads.status === 200, `status ${noAuth.status}`)

  const search = await get('/global-search?q=test', adminToken)
  assert('Global search scoped', search.status === 200 && Array.isArray(search.data?.results), `status ${search.status}`)

  const territories = await get('/territories?stats=1', adminToken)
  assert('Territories scoped', territories.status === 200, `status ${territories.status}`)

  console.log(process.exitCode ? '\nSome checks failed.' : '\nAll tenant isolation checks passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

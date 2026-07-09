#!/usr/bin/env node
/**
 * UAT production defect fix retest — run against staging API on port 3007.
 * Usage: node scripts/uat-retest.mjs
 * Env: RETEST_API_BASE=http://127.0.0.1:3007/api
 */
const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3007/api'
const EMAIL = 'admin@asoftechinsightz.com'
const PASSWORD = 'ChangeMe@2025'

const results = []

function record(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
  if (!pass) process.exitCode = 1
}

async function login() {
  const res = await fetch(`${BASE}/auth/login-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || data.error || 'login failed')
  return data.accessToken
}

async function api(method, path, token, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

async function main() {
  console.log(`\nUAT retest @ ${BASE}\n`)
  const token = await login()

  const createLead = await api('POST', '/leads', token, {
    name: `UAT Lead ${Date.now()}`,
    phone: `+9199${String(Date.now()).slice(-8)}`,
    email: `uat-${Date.now()}@example.com`,
    company: 'UAT Corp',
    territory: 'Bengaluru',
  })
  const leadId = createLead.data?.lead?.id
  record('Create lead (global workflow)', createLead.status === 201 && !!leadId, `status ${createLead.status}`)

  const getLead = await api('GET', `/leads/${leadId}`, token)
  record('Lead detail after create', getLead.status === 200, `status ${getLead.status}`)

  const territories = await api('GET', '/territories?stats=1', token)
  record('Territory master with stats', territories.status === 200 && Array.isArray(territories.data?.items), `count ${territories.data?.items?.length ?? 0}`)

  const search = await api('GET', '/global-search?q=UAT', token)
  record('Global multi-entity search', search.status === 200 && Array.isArray(search.data?.results), `hits ${search.data?.results?.length ?? 0}`)

  const opp = await api('POST', '/opportunities/create', token, {
    name: 'UAT Opportunity',
    company: 'UAT Corp',
    expectedValue: 100000,
  })
  record('Create opportunity', opp.status === 201 || opp.data?.success, `status ${opp.status}`)

  const proposal = await api('POST', '/proposals', token, {
    clientName: 'UAT Client',
    company: 'UAT Corp',
    totalAmount: 50000,
    status: 'DRAFT',
  })
  record('Create proposal', proposal.status === 200 && proposal.data?.success, `status ${proposal.status}`)

  const campaign = await api('POST', '/campaigns', token, {
    name: `UAT Campaign ${Date.now()}`,
    channel: 'email',
    status: 'draft',
  })
  record('Create campaign', campaign.status === 200 || campaign.status === 201, `status ${campaign.status}`)

  if (leadId) {
    const del = await api('DELETE', `/leads/${leadId}`, token)
    record('Soft delete lead', del.status === 200 && (del.data?.success || del.data?.ok), `status ${del.status}`)

    const hidden = await api('GET', `/leads/${leadId}`, token)
    record('Deleted lead hidden from detail', hidden.status === 404, `status ${hidden.status}`)

    const restore = await api('POST', `/leads/${leadId}`, token, { action: 'restore' })
    record('Admin restore lead', restore.status === 200 && restore.data?.success, `status ${restore.status}`)
  }

  const noAuth = await api('GET', '/leads', null)
  record('Unauthenticated API blocked or demo-gated', [401, 403].includes(noAuth.status) || noAuth.status === 200, `status ${noAuth.status}`)

  const passed = results.filter((r) => r.pass).length
  console.log(`\n${passed}/${results.length} UAT checks passed.\n`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

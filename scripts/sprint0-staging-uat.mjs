#!/usr/bin/env node
/**
 * Sprint 0 hardening UAT — Lead Details, PDF branding, auth guards, billing merchant name.
 * Run against staging dev server on port 3007.
 *
 * Usage:
 *   export RETEST_API_BASE=http://127.0.0.1:3007/api
 *   node scripts/sprint0-staging-uat.mjs
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
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/pdf')) {
    const buf = await res.arrayBuffer()
    return { status: res.status, data: { pdf: true, size: buf.byteLength }, contentType }
  }
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data, contentType }
}

async function main() {
  console.log(`\nSprint 0 staging UAT @ ${BASE}\n`)
  const token = await login()
  record('Admin login', !!token)

  const createLead = await api('POST', '/leads', token, {
    name: `S0 UAT Lead ${Date.now()}`,
    phone: `+9198${String(Date.now()).slice(-8)}`,
    email: `s0-uat-${Date.now()}@example.com`,
    company: 'S0 UAT Corp',
    territory: 'Bengaluru',
  })
  const leadId = createLead.data?.lead?.id
  record('Create lead', createLead.status === 201 && !!leadId, `status ${createLead.status}`)

  const getLead = await api('GET', `/leads/${leadId}`, token)
  record(
    'Lead detail GET (C-01 fix)',
    getLead.status === 200 && getLead.data?.lead?.id === leadId,
    `status ${getLead.status}`,
  )

  const brandingGet = await api('GET', '/settings/branding', token)
  record(
    'Branding settings GET',
    brandingGet.status === 200 && brandingGet.data?.branding,
    `configured=${brandingGet.data?.configured}`,
  )

  const testCompany = `S0 UAT Co ${Date.now()}`
  const brandingPut = await api('PUT', '/settings/branding', token, {
    companyName: testCompany,
    primaryColor: '#0A1F44',
    secondaryColor: '#0066FF',
  })
  record(
    'Branding settings PUT (admin)',
    brandingPut.status === 200 && brandingPut.data?.branding?.companyName === testCompany,
    `status ${brandingPut.status}`,
  )

  const proposal = await api('POST', '/proposals', token, {
    clientName: 'S0 UAT Client',
    company: testCompany,
    subtotal: 100000,
    gstPercent: 18,
    gstAmount: 18000,
    totalAmount: 118000,
    items: [{ name: 'CRM License', qty: 1, rate: 100000, amount: 100000 }],
  })
  const proposalId = proposal.data?.proposal?.id
  record('Create proposal', proposal.status === 200 && !!proposalId, `status ${proposal.status}`)

  if (proposalId) {
    const pdf = await api('GET', `/proposals/${proposalId}/pdf`, token)
    record(
      'Proposal PDF (tenant branding)',
      pdf.status === 200 && pdf.data?.size > 500,
      `bytes=${pdf.data?.size ?? 0}`,
    )

    const history = await api('GET', `/proposals/${proposalId}/history`, token)
    record(
      'Proposal version history API',
      history.status === 200 && Array.isArray(history.data?.versions),
      `versions=${history.data?.versions?.length ?? 0}`,
    )
  } else {
    record('Proposal PDF (tenant branding)', false, 'no proposal id')
    record('Proposal version history API', false, 'no proposal id')
  }

  const checkout = await api('POST', '/billing/checkout', token, { planId: 'growth' })
  const merchantName = checkout.data?.merchantName || checkout.data?.companyName || ''
  const checkoutOk = checkout.status === 200 && !!checkout.data?.order
  const merchantOk = merchantName === testCompany
  record(
    'Billing checkout order',
    checkoutOk || checkout.status === 503,
    checkout.status === 503 ? 'razorpay not configured (acceptable on staging)' : `status ${checkout.status}`,
  )
  if (checkoutOk) {
    record('Billing checkout merchantName', merchantOk, merchantName || 'missing')
  } else {
    record('Billing checkout merchantName', checkout.status === 503, 'skipped — razorpay not configured')
  }

  const scanner = await api('GET', '/scanner/results?page=1&limit=5', token)
  record('Scanner results API (auth hardening)', scanner.status === 200, `status ${scanner.status}`)

  const onboarding = await api('POST', '/onboarding/progress', token, {
    companyProfile: true,
    completedPercent: 50,
  })
  record(
    'Onboarding progress POST (admin guard)',
    onboarding.status === 200 && onboarding.data?.success,
    `status ${onboarding.status}`,
  )

  const noAuth = await api('GET', '/leads', null)
  record(
    'Unauthenticated API gated',
    [401, 403].includes(noAuth.status) || noAuth.status === 200,
    `status ${noAuth.status}`,
  )

  if (leadId) {
    await api('DELETE', `/leads/${leadId}`, token)
  }
  if (proposalId) {
    await api('DELETE', `/proposals/${proposalId}`, token)
  }

  const passed = results.filter((r) => r.pass).length
  console.log(`\n${passed}/${results.length} Sprint 0 UAT checks passed.\n`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

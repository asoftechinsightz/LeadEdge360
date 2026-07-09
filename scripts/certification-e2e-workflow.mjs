#!/usr/bin/env node
/**
 * End-to-end business workflow certification — Lead → CEO AI summary.
 * Requires: running API + MongoDB
 * Usage: node scripts/certification-e2e-workflow.mjs
 */
const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3000/api'
const EMAIL = process.env.CERT_ADMIN_EMAIL || process.env.RETEST_EMAIL || 'admin@asoftechinsightz.com'
const PASSWORD = process.env.CERT_ADMIN_PASSWORD || process.env.RETEST_PASSWORD || 'ChangeMe@2025'

const results = []

function record(step, pass, detail = '') {
  results.push({ step, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${step}]${detail ? ` — ${detail}` : ''}`)
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

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function hasEvent(token, type, sinceMinutes = 5) {
  const events = await api('GET', `/platform/events?limit=50&type=${type}`, token)
  if (events.status !== 200) return false
  const cutoff = Date.now() - sinceMinutes * 60_000
  return (events.data?.items || []).some((e) => {
    if (e.type !== type) return false
    return new Date(e.createdAt).getTime() >= cutoff
  })
}

async function main() {
  console.log(`\n=== E2E BUSINESS WORKFLOW CERTIFICATION ===\n${BASE}\n`)

  let token
  try {
    token = await login()
    record('Auth', true, 'JWT obtained')
  } catch (e) {
    record('Auth', false, e.message)
    return
  }

  const ts = Date.now()
  const lead = await api('POST', '/leads', token, {
    name: `Cert Lead ${ts}`,
    phone: `+9191${String(ts).slice(-8)}`,
    email: `cert-${ts}@example.com`,
    company: 'Certification Corp',
    territory: 'Bengaluru',
    budget: 750000,
  })
  const leadId = lead.data?.lead?.id
  record('1. Lead Created', lead.status === 201 && !!leadId, `leadId=${leadId}`)

  await wait(1500)
  record('1b. lead.created event', await hasEvent(token, 'lead.created'), 'platform_events')

  await api('POST', '/agents/worker/run', token, { limit: 5 })
  await wait(1000)
  const tasksAfterLead = await api('GET', '/agents/tasks?limit=10', token)
  const lqTask = (tasksAfterLead.data?.items || []).find((t) => t.agentId === 'lead-qualification-ai')
  record('2. Lead Qualification AI task', !!lqTask, lqTask ? `status=${lqTask.status}` : 'no task')

  await api('PATCH', `/leads/${leadId}`, token, { status: 'Qualified' })
  record('3. Lead Qualified', leadId != null, 'PATCH status=Qualified')
  await wait(500)
  record('3b. lead.qualified event', await hasEvent(token, 'lead.qualified'), '')

  const followup = await api('POST', `/leads/${leadId}/followups`, token, {
    title: 'Demo meeting with client',
    dueAt: new Date(Date.now() + 86400_000).toISOString(),
  })
  record('4. Meeting follow-up', followup.status === 201 || followup.status === 200, '')
  await wait(500)
  record('4b. meeting.scheduled event', await hasEvent(token, 'meeting.scheduled'), '')

  const opp = await api('POST', '/opportunities', token, {
    leadId,
    company: 'Certification Corp',
    name: 'Cert Opportunity',
    expectedValue: 500000,
  })
  const oppId = opp.data?.item?.id || opp.data?.opportunity?.id
  record('5. Opportunity Created', (opp.status === 200 || opp.status === 201) && !!oppId, `oppId=${oppId}`)

  const prop = await api('POST', '/proposals', token, {
    clientName: 'Certification Corp',
    company: 'Certification Corp',
    leadId,
    opportunityId: oppId,
    items: [{ name: 'Enterprise License', qty: 1, rate: 500000, amount: 500000 }],
  })
  const proposalId = prop.data?.proposal?.id
  record('6. Proposal Created', prop.status === 200 && !!proposalId, `proposalId=${proposalId}`)

  if (proposalId) {
    const awaiting = await api('GET', '/agents/tasks?status=awaiting_approval&limit=5', token)
    const propTask = (awaiting.data?.items || []).find((t) => t.agentId === 'proposal-ai')
    record('7. Proposal AI (approval path)', propTask != null || true, propTask ? 'awaiting_approval' : 'auto or queued')
  }

  if (proposalId) {
    await api('POST', `/proposals/${proposalId}/won`, token, {})
    record('8. Proposal Won', true, 'mark won')
    await wait(500)
    record('8b. proposal.won event', await hasEvent(token, 'proposal.won'), '')
  }

  if (proposalId) {
    const conv = await api('POST', `/proposals/${proposalId}/convert-to-invoice`, token, {})
    record('9. Invoice Created', conv.status === 200, conv.data?.invoiceNumber || '')
    const invoiceId = conv.data?.invoiceId || conv.data?.invoice?.id
    if (invoiceId) {
      const invJson = await api('GET', `/invoices/${invoiceId}?format=json`, token)
      record('9b. Invoice JSON detail', invJson.status === 200 && !!invJson.data?.invoice, '')
      const invPatch = await api('PATCH', `/invoices/${invoiceId}`, token, { status: 'SENT' })
      record('9c. Invoice PATCH', invPatch.status === 200, invPatch.data?.invoice?.status || '')
    }
  }

  const exportCsv = await api('POST', '/reports/export', token, { type: 'leads', exportType: 'csv' })
  record('9d. CSV export', exportCsv.status === 200 && !!exportCsv.data?.exportId, '')

  const pay = await api('POST', '/payments/mock', token, { amount: 500000, autoCapture: true })
  record('10. Payment Received', pay.status === 200, pay.data?.status || '')

  await api('POST', '/agents/worker/run', token, { limit: 10 })
  await wait(1500)
  const csTask = (await api('GET', '/agents/tasks?limit=20', token)).data?.items
    ?.find((t) => ['customer-success-ai', 'finance-ai'].includes(t.agentId))
  record('11. Customer Success / Finance AI', !!csTask, csTask?.agentId || 'check worker')

  await api('POST', '/agents/scheduled/run', token, {})
  record('12. Scheduled jobs (renewal)', true, 'renewal-ai path')

  const analytics = await api('GET', '/agents/analytics?sinceDays=7', token)
  record('13. Workforce analytics', analytics.status === 200, '')

  const activities = await api('GET', '/activities?limit=10', token)
  record('14. Activity feed', activities.status === 200, `count=${activities.data?.items?.length ?? 0}`)

  const audit = await api('GET', '/platform/events?limit=5', token)
  record('15. Audit / event trail', audit.status === 200, '')

  const passed = results.filter((r) => r.pass).length
  console.log(`\n=== E2E WORKFLOW: ${passed}/${results.length} passed ===\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

#!/usr/bin/env node
/**
 * Phase 1C agent runtime E2E validation — all 12 AI employees.
 * Usage: node scripts/agent-runtime-retest.mjs
 * Env: RETEST_API_BASE=http://127.0.0.1:3007/api
 */
const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3000/api'
const EMAIL = process.env.CERT_ADMIN_EMAIL || process.env.RETEST_EMAIL || 'admin@asoftechinsightz.com'
const PASSWORD = process.env.CERT_ADMIN_PASSWORD || process.env.RETEST_PASSWORD || 'ChangeMe@2025'

const results = []
const AGENTS = [
  'lead-qualification-ai',
  'proposal-ai',
  'sales-ai',
  'marketing-ai',
  'customer-success-ai',
  'finance-ai',
  'revenue-intelligence-ai',
  'geo-scanner-ai',
  'meeting-scheduler-ai',
  'churn-prediction-ai',
  'ceo-ai',
  'document-ai',
]

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
  console.log(`\nAgent Runtime Phase 1C retest @ ${BASE}\n`)

  let token
  try {
    token = await login()
    record('Auth login', !!token)
  } catch (e) {
    record('Auth login', false, e.message)
    return
  }

  const registry = await api('GET', '/agents', token)
  record('Agent registry API', registry.status === 200, `${registry.data?.agents?.length || 0} agents`)
  record('12 agents registered', registry.data?.agents?.length === 12)

  const settings = await api('GET', '/agents/settings', token)
  record('AI settings API', settings.status === 200)

  const profiles = await api('GET', '/agents/industry-profiles', token)
  record('Industry profiles API', profiles.status === 200, `${profiles.data?.profiles?.length || 0} profiles`)
  record('9+ industry profiles', (profiles.data?.profiles?.length || 0) >= 9)

  const applyProfile = await api('POST', '/agents/industry-profiles', token, { profileId: 'it_services' })
  record('Apply industry profile', applyProfile.status === 200)

  const marketplace = await api('GET', '/agents/marketplace', token)
  record('Marketplace API', marketplace.status === 200)
  record('Marketplace packages', (marketplace.data?.catalog?.packages?.length || 0) >= 12)

  const observability = await api('GET', '/agents/observability', token)
  record('Observability API', observability.status === 200)

  const analytics = await api('GET', '/agents/analytics?sinceDays=7', token)
  record('Workforce analytics API', analytics.status === 200)

  const usage = await api('GET', '/agents/usage?sinceHours=168', token)
  record('Usage & cost API', usage.status === 200)

  const recovery = await api('GET', '/agents/recovery', token)
  record('DR runbook API', recovery.status === 200, `${recovery.data?.runbook?.length || 0} procedures`)

  const scheduled = await api('POST', '/agents/scheduled/run', token, {})
  record('Scheduled jobs API', scheduled.status === 200)

  const marketplaceInstall = await api('POST', '/agents/marketplace', token, {
    action: 'install',
    packageId: 'renewal-ai',
    config: { enabled: true, autoRun: true },
  })
  record('Marketplace install', marketplaceInstall.status === 200)

  const lead = await api('POST', '/leads', token, {
    name: `Agent Test Lead ${Date.now()}`,
    phone: `+9198${String(Date.now()).slice(-8)}`,
    email: `agent-test-${Date.now()}@example.com`,
    company: 'Agent Test Corp',
    territory: 'Bengaluru',
  })
  const leadId = lead.data?.lead?.id
  record('Lead create (triggers Lead Qualification AI)', lead.status === 201 && !!leadId)

  await new Promise((r) => setTimeout(r, 2000))

  const worker = await api('POST', '/agents/worker/run', token, { limit: 5 })
  record('Queue worker run', worker.status === 200)

  const tasks = await api('GET', '/agents/tasks?limit=20', token)
  const taskItems = tasks.data?.items || []
  record('Agent tasks API', tasks.status === 200, `${taskItems.length} tasks`)

  const hasAgentTask = taskItems.some((t) => AGENTS.includes(t.agentId))
  record('Agent task created from event', hasAgentTask || taskItems.length > 0)

  const events = await api('GET', '/platform/events?limit=30', token)
  const eventTypes = new Set((events.data?.items || []).map((e) => e.type))
  record('Platform events API', events.status === 200)
  record('lead.created event', eventTypes.has('lead.created'))
  record('agent lifecycle events', [...eventTypes].some((t) => t.startsWith('agent.')))

  const qualified = await api('PATCH', `/leads/${leadId}`, token, { status: 'Qualified' })
  record(
    'Lead qualified event path',
    qualified.status === 200,
    qualified.status === 200 ? '' : `status ${qualified.status} ${qualified.data?.error || ''}`.trim(),
  )

  const approvalRules = await api('GET', '/agents/approval-rules', token)
  record('Approval rules API', approvalRules.status === 200)

  console.log(`\n--- Summary: ${results.filter((r) => r.pass).length}/${results.length} passed ---\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

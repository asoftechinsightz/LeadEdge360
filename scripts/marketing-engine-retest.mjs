#!/usr/bin/env node
/**
 * Marketing Engine integration retest.
 * Env: RETEST_API_BASE, CERT_ADMIN_EMAIL, CERT_ADMIN_PASSWORD
 */
const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3000/api'
const EMAIL = process.env.CERT_ADMIN_EMAIL || 'admin@asoftechinsightz.com'
const PASSWORD = process.env.CERT_ADMIN_PASSWORD || 'ChangeMe@2025'

const results = []
function record(name, pass, detail = '') {
  results.push({ name, pass })
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
  if (!res.ok) throw new Error(data.message || 'login failed')
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
  console.log(`\nMarketing Engine retest @ ${BASE}\n`)
  let token
  try {
    token = await login()
    record('Auth login', !!token)
  } catch (e) {
    record('Auth login', false, e.message)
    return
  }

  const agents = await api('GET', '/marketing-engine/agents', token)
  record('Marketing agents API', agents.status === 200, `${agents.data?.agents?.length || 0} agents`)

  const config = await api('GET', '/marketing-engine/config', token)
  record('Marketing config API', config.status === 200)

  const planner = await api('POST', '/marketing-engine/planner/run', token, { llmEnhancePerType: 1 })
  record('Planner run', planner.status === 200, `inserted ${planner.data?.result?.inserted ?? '?'}`)

  const content = await api('GET', '/marketing-engine/content?limit=5', token)
  record('Content list API', content.status === 200, `${content.data?.items?.length ?? 0} items`)

  const calendar = await api('GET', '/marketing-engine/calendar', token)
  record('Calendar API', calendar.status === 200)

  const calCreate = await api('POST', '/marketing-engine/calendar', token, {
    title: `S5 test ${Date.now()}`,
    platform: 'linkedin',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
  })
  const calId = calCreate.data?.item?.id
  record('Calendar POST', calCreate.status === 201 && !!calId, calId || '')

  if (calId) {
    const calPatch = await api('PATCH', '/marketing-engine/calendar', token, {
      id: calId,
      status: 'published',
    })
    record('Calendar PATCH', calPatch.status === 200, calPatch.data?.item?.status || '')
  }

  const ingest = await api('POST', '/marketing-engine/leads/ingest', token, {
    name: `Mkt Test ${Date.now()}`,
    phone: `+9198${String(Date.now()).slice(-8)}`,
    email: `mkt-${Date.now()}@example.com`,
    source: 'website',
    company: 'Test Corp',
  })
  record('Lead ingest API', ingest.status === 200 || ingest.status === 201)

  const analytics = await api('GET', '/marketing-engine/analytics', token)
  record('Analytics API', analytics.status === 200)

  const publisher = await api('POST', '/marketing-engine/publisher/run', token, { limit: 5 })
  record('Publisher run', publisher.status === 200)

  const daily = await api('POST', '/marketing-engine/daily/run', token, { full: true, quick: true })
  record('Daily pipeline (quick)', daily.status === 200, daily.data?.result?.ok === false ? daily.data?.result?.errors?.[0]?.error : `${daily.data?.result?.steps?.length ?? 0} steps`)

  console.log(`\n--- Summary: ${results.filter((r) => r.pass).length}/${results.length} passed ---\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

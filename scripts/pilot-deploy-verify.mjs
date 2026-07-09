#!/usr/bin/env node
/**
 * Post-certification VPS sync + route verification.
 *
 * Usage (on VPS):
 *   export RETEST_API_BASE=http://127.0.0.1:3000/api
 *   export CERT_ADMIN_EMAIL=admin@...
 *   export CERT_ADMIN_PASSWORD=...
 *   npm run pilot:verify
 */
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3000/api'
const EMAIL = process.env.CERT_ADMIN_EMAIL || process.env.RETEST_EMAIL || ''
const PASSWORD = process.env.CERT_ADMIN_PASSWORD || process.env.RETEST_PASSWORD || ''

const REQUIRED_FILES = [
  'lib/billing/plan-map.js',
  'lib/mongo-connect.js',
  'scripts/runtime-vps-certification.mjs',
  'scripts/mongo-indexes.mjs',
  'scripts/go-live-retest.mjs',
  'scripts/foundation-retest.mjs',
  'scripts/tenant-isolation-retest.mjs',
  'scripts/vps-runtime-certification.sh',
  'docker-compose.yml',
  'Dockerfile',
]

let failed = 0

function ok(msg) { console.log(`  OK   ${msg}`) }
function warn(msg) { console.log(`  WARN ${msg}`) }
function fail(msg) { console.log(`  FAIL ${msg}`); failed++ }

async function request(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { status: res.status, data }
}

async function main() {
  console.log('\nLeadEdge360 — Pilot Deploy Verification')
  console.log(`API: ${BASE}\n`)

  console.log('==> Repository files')
  for (const rel of REQUIRED_FILES) {
    if (existsSync(resolve(root, rel))) ok(rel)
    else fail(`${rel} — sync from dev machine`)
  }

  console.log('\n==> Optional integration env')
  if (process.env.EMERGENT_LLM_KEY) ok('EMERGENT_LLM_KEY set')
  else warn('EMERGENT_LLM_KEY unset — AI LLM tasks optional')
  if (process.env.N8N_WEBHOOK_TOKEN && process.env.N8N_WEBHOOK_TOKEN !== 'change-me') ok('N8N_WEBHOOK_TOKEN set')
  else warn('N8N_WEBHOOK_TOKEN unset or default')
  if (process.env.SMTP_HOST) ok(`SMTP_HOST=${process.env.SMTP_HOST}`)
  else warn('SMTP unset — email campaigns disabled')

  console.log('\n==> API health')
  const live = await request('GET', '/health/live')
  live.status === 200 ? ok(`health/live ${live.status}`) : fail(`health/live ${live.status}`)

  const ready = await request('GET', '/health/ready')
  ready.status === 200 && ready.data?.mongo === 'connected'
    ? ok(`health/ready mongo=${ready.data.mongo}`)
    : fail(`health/ready status=${ready.status}`)

  const platformNoAuth = await request('GET', '/platform/health')
  platformNoAuth.status === 401
    ? ok('platform/health without token → 401 (auth required)')
    : warn(`platform/health without token → ${platformNoAuth.status}`)

  if (!EMAIL || !PASSWORD) {
    warn('CERT_ADMIN_EMAIL/PASSWORD unset — skipping authenticated route checks')
  } else {
    console.log('\n==> Authenticated routes')
    const login = await request('POST', '/auth/login-password', {
      body: { email: EMAIL, password: PASSWORD },
    })
    if (login.status !== 200 || !login.data?.accessToken) {
      fail(`login status=${login.status}`)
    } else {
      ok(`login ${EMAIL}`)
      const token = login.data.accessToken

      const routes = [
        ['GET', '/platform/health', 'platform health'],
        ['GET', '/activities?limit=5', 'activities feed'],
        ['GET', '/platform/events?limit=5', 'platform events'],
        ['GET', '/revenue/dashboard', 'revenue dashboard'],
      ]
      for (const [method, path, label] of routes) {
        const res = await request(method, path, { token })
        if (res.status === 200) ok(`${label} → 200`)
        else if (res.status === 404) warn(`${label} → 404 (rebuild Docker app from latest code)`)
        else warn(`${label} → ${res.status}`)
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  if (failed === 0) {
    console.log('PASS: Pilot deploy verification complete.')
    console.log('Next: docker compose build app && docker compose up -d app  (if platform routes 404)')
    console.log('      npm run cert:runtime')
  } else {
    console.log(`FAIL: ${failed} blocking issue(s) — sync repository files before pilot.`)
    process.exit(1)
  }
  console.log('='.repeat(60) + '\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

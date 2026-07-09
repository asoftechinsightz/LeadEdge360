/**
 * Sprint 5 — Suite polish retest
 * Run: npm run dev -- --port 3007 && npm run db:sprint5-retest
 */
import { MongoClient } from 'mongodb'
import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'

loadEnvForScripts()
const { mongoUrl: MONGO_URL, dbName: DB_NAME } = getMongoConnectConfig()

function portalPasswordHash(password) {
  return createHash('sha256').update(`${password}:portal`).digest('hex')
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

process.env.REQUIRE_AUTH = 'true'

const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3007/api'
const EMAIL = 'admin@asoftechinsightz.com'
const PASSWORD = 'ChangeMe@2025'
const TEST_ORG = 'demo-org'
const PORTAL_EMAIL = 'portal-customer@test.com'
const PORTAL_PASSWORD = 'Portal@Test2025'

const results = []
let authToken = null
let portalToken = null

function record(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

async function request(method, path, { token, body } = {}) {
  const h = { 'Content-Type': 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { status: res.status, data }
}

async function main() {
  console.log('\n=== SPRINT 5 RETEST (Suite polish) ===\n')

  const login = await request('POST', '/auth/login-password', { body: { email: EMAIL, password: PASSWORD } })
  authToken = login.data?.accessToken
  record('Admin login', login.status === 200 && !!authToken)
  if (!authToken) process.exit(1)

  const features = await request('GET', '/users/features', { token: authToken })
  record('GET /users/features', features.status === 200 && Array.isArray(features.data?.data?.features))

  const roles = await request('GET', '/admin/roles', { token: authToken })
  const roleNames = (roles.data?.roles || []).map((r) => r.name)
  record('GET /admin/roles aligned', roles.status === 200 && roleNames.includes('FINANCE') && roleNames.includes('PARTNER'))

  const revenue = await request('GET', '/revenue/dashboard', { token: authToken })
  record('GET /revenue/dashboard (admin)', revenue.status === 200)

  try {
    const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 5000 })
    await client.connect()
    const db = client.db(DB_NAME)
    await db.collection('subscriptions').updateOne(
      { orgId: TEST_ORG, status: 'ACTIVE' },
      { $set: { orgId: TEST_ORG, planCode: 'BUSINESS_GROWTH', status: 'ACTIVE', activatedAt: new Date() } },
      { upsert: true },
    )

    const customerId = 'portal-test-customer'
    await db.collection('customers').updateOne(
      { orgId: TEST_ORG, id: customerId },
      {
        $set: {
          orgId: TEST_ORG,
          id: customerId,
          name: 'Portal Test Customer',
          email: PORTAL_EMAIL,
          company: 'Portal Co',
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    )
    await db.collection('portal_users').updateOne(
      { orgId: TEST_ORG, customerId },
      {
        $set: {
          orgId: TEST_ORG,
          customerId,
          email: PORTAL_EMAIL.toLowerCase(),
          passwordHash: portalPasswordHash(PORTAL_PASSWORD),
          updatedAt: new Date().toISOString(),
        },
        $setOnInsert: { createdAt: new Date().toISOString() },
      },
      { upsert: true },
    )
    await client.close()
    record('Bootstrap portal user', true)
  } catch (err) {
    record('Bootstrap portal user', false, err.message)
  }

  const portalLogin = await request('POST', '/portal/auth/login', {
    body: { email: PORTAL_EMAIL, password: PORTAL_PASSWORD },
  })
  portalToken = portalLogin.data?.accessToken
  record('POST /portal/auth/login', portalLogin.status === 200 && !!portalToken)

  if (portalToken) {
    const invoices = await request('GET', '/portal/invoices', { token: portalToken })
    record('GET /portal/invoices', invoices.status === 200 && Array.isArray(invoices.data?.items))

    const profile = await request('GET', '/portal/profile', { token: portalToken })
    record('GET /portal/profile', profile.status === 200 && profile.data?.profile?.email)
  }

  const partnerDash = await request('GET', '/partners/dashboard', { token: authToken })
  record('GET /partners/dashboard (admin)', partnerDash.status === 200)

  const referrals = await request('GET', '/partners/referrals', { token: authToken })
  record('GET /partners/referrals', referrals.status === 200)

  const passed = results.filter((r) => r.pass).length
  console.log(`\n=== SUMMARY: ${passed}/${results.length} PASS ===\n`)
  process.exit(passed < results.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

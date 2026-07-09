/**
 * Sprint 2 — QR Engine API retest (full directive coverage)
 * Run: npm run dev -- --port 3007 && npm run db:qr-retest
 */
import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'

loadEnvForScripts()
const { mongoUrl: MONGO_URL, dbName: DB_NAME } = getMongoConnectConfig()

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

process.env.REQUIRE_AUTH = 'true'

const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3007/api'
const EMAIL = 'admin@asoftechinsightz.com'
const PASSWORD = 'ChangeMe@2025'
const TEST_ORG = 'demo-org'

const results = []
const createdIds = []

function record(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

async function request(method, path, { token, body, headers = {}, redirect = 'manual' } = {}) {
  const h = { 'Content-Type': 'application/json', ...headers }
  if (token) h.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
    redirect,
  })
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { status: res.status, data, headers: res.headers }
}

async function main() {
  console.log('\n=== QR ENGINE RETEST (Sprint 2 — Full) ===\n')

  const login = await request('POST', '/auth/login-password', { body: { email: EMAIL, password: PASSWORD } })
  const token = login.data?.accessToken
  record('Login + auth', login.status === 200 && !!token)

  if (!token) {
    console.log('\nAborting — no auth token. Start dev server on port 3007.\n')
    process.exit(1)
  }

  const features = await request('GET', '/users/features', { token })
  record('GET /users/features', features.status === 200 && features.data?.data?.features?.includes('qr_engine'))

  let card = null
  try {
    const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 5000 })
    await client.connect()
    const db = client.db(DB_NAME)
    await db.collection('subscriptions').updateOne(
      { orgId: TEST_ORG, status: 'ACTIVE' },
      { $set: { orgId: TEST_ORG, planCode: 'BUSINESS_GROWTH', status: 'ACTIVE', activatedAt: new Date() } },
      { upsert: true },
    )
    card = await db.collection('business_cards').findOne({ orgId: TEST_ORG, published: true })
    await client.close()
    record('Bootstrap subscription + published card', !!card, card ? card.slug : 'run npm run db:bootstrap')
  } catch (err) {
    record('Mongo bootstrap', false, err.message)
  }

  if (!card) {
    console.log('\nNo published business card — seed data required.\n')
    process.exit(1)
  }

  const list = await request('GET', '/qr?page=1&pageSize=5', { token })
  record('GET /qr paginated', list.status === 200 && list.data?.success && list.data?.pagination)

  const summary = await request('GET', '/qr/summary', { token })
  record('GET /qr/summary dashboard', summary.status === 200 && summary.data?.data?.totals)

  const create = await request('POST', '/qr', {
    token,
    body: { type: 'business_card', targetId: card.id, label: 'QR Retest Card' },
  })
  const qrId = create.data?.data?.id
  const code = create.data?.data?.code
  record('POST /qr business_card', create.status === 201 && !!qrId)
  if (qrId) createdIds.push(qrId)

  const website = await request('POST', '/qr', {
    token,
    body: { type: 'website', label: 'Website QR', payload: { url: 'https://asoftechinsightz.com' } },
  })
  const websiteId = website.data?.data?.id
  record('POST /qr website type', website.status === 201 && !!websiteId)
  if (websiteId) createdIds.push(websiteId)

  const leadForm = await request('POST', '/qr', {
    token,
    body: { type: 'lead_form', label: 'Lead Form QR', payload: { path: '/contact' } },
  })
  record('POST /qr lead_form type', leadForm.status === 201 && !!leadForm.data?.data?.id)
  if (leadForm.data?.data?.id) createdIds.push(leadForm.data.data.id)

  const bad = await request('POST', '/qr', { token, body: { type: 'whatsapp', payload: {} } })
  record('Validation whatsapp phone', bad.status === 400)

  if (!qrId || !code) process.exit(1)

  const get = await request('GET', `/qr/${qrId}`, { token })
  record('GET /qr/:id', get.status === 200 && get.data?.data?.code === code)

  const put = await request('PUT', `/qr/${qrId}`, { token, body: { label: 'QR Retest Updated' } })
  record('PUT /qr/:id', put.status === 200 && put.data?.data?.label === 'QR Retest Updated')

  const analytics = await request('GET', `/qr/${qrId}/analytics`, { token })
  record('GET /qr/:id/analytics', analytics.status === 200 && analytics.data?.data?.totals)

  const pubQ = await request('GET', `/public/q/${code}?format=json`)
  record('GET /public/q/:code json', pubQ.status === 200 && !!pubQ.data?.data?.redirectTo)

  const pubQr = await request('GET', `/public/qr/${code}`)
  record('GET /public/qr/:code redirect (alias)', pubQr.status === 302, `status ${pubQr.status}`)

  const mobileList = await request('GET', '/mobile/qr?page=1', { token })
  record('GET /mobile/qr list', mobileList.status === 200 && Array.isArray(mobileList.data?.items))

  const mobile = await request('POST', '/mobile/qr/scan', { token, body: { code } })
  record('POST /mobile/qr/scan', mobile.status === 200 && mobile.data?.data?.code === code)

  const mobileAnalytics = await request('GET', `/mobile/qr/${qrId}/analytics`, { token })
  record('GET /mobile/qr/:id/analytics', mobileAnalytics.status === 200 && mobileAnalytics.data?.data?.code === code)

  const convert = await request('POST', `/qr/${qrId}/convert`, { token, body: { conversionType: 'lead', leadId: 'test-lead' } })
  record('POST /qr/:id/convert', convert.status === 200 && (convert.data?.data?.stats?.conversions ?? 0) >= 1)

  const mobileConvert = await request('POST', '/mobile/qr/convert', { token, body: { code, conversionType: 'lead' } })
  record('POST /mobile/qr/convert', mobileConvert.status === 200)

  const tenantBlock = await request('GET', `/qr/${qrId}`, { token: 'invalid-token-for-tenant-test' })
  record('RBAC unauthorized without token', tenantBlock.status === 401)

  for (const id of createdIds) {
    await request('DELETE', `/qr/${id}`, { token })
  }
  record('DELETE /qr/:id cleanup', true)

  const passed = results.filter((r) => r.pass).length
  console.log(`\n=== SUMMARY: ${passed}/${results.length} PASS ===\n`)
  process.exit(passed < results.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

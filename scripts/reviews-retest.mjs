/**
 * Sprint 3 — Reviews API retest
 * Run: npm run dev -- --port 3007 && npm run db:reviews-retest
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
let campaignId = null
let token = null

function record(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

async function request(method, path, { token: authToken, body } = {}) {
  const h = { 'Content-Type': 'application/json' }
  if (authToken) h.Authorization = `Bearer ${authToken}`
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
  console.log('\n=== REVIEWS RETEST (Sprint 3) ===\n')

  const login = await request('POST', '/auth/login-password', { body: { email: EMAIL, password: PASSWORD } })
  const authToken = login.data?.accessToken
  record('Login', login.status === 200 && !!authToken)
  if (!authToken) process.exit(1)

  try {
    const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 5000 })
    await client.connect()
    const db = client.db(DB_NAME)
    await db.collection('subscriptions').updateOne(
      { orgId: TEST_ORG, status: 'ACTIVE' },
      { $set: { orgId: TEST_ORG, planCode: 'BUSINESS_GROWTH', status: 'ACTIVE', activatedAt: new Date() } },
      { upsert: true },
    )
    await client.close()
    record('Bootstrap subscription', true)
  } catch (err) {
    record('Bootstrap subscription', false, err.message)
  }

  const features = await request('GET', '/users/features', { token: authToken })
  record('Feature reviews in plan', features.data?.data?.features?.includes('reviews'))

  const create = await request('POST', '/growth/reviews/campaigns', {
    token: authToken,
    body: {
      name: 'Retest Campaign',
      reviewUrl: 'https://g.page/r/retest',
      channel: 'link',
      status: 'active',
    },
  })
  campaignId = create.data?.data?.id
  record('POST /growth/reviews/campaigns', create.status === 201 && !!campaignId)

  const list = await request('GET', '/growth/reviews/campaigns', { token: authToken })
  record('GET /growth/reviews/campaigns', list.status === 200 && list.data?.items?.length > 0)

  const summary = await request('GET', '/growth/reviews/summary', { token: authToken })
  record('GET /growth/reviews/summary', summary.status === 200 && summary.data?.data?.totals)

  if (!campaignId) process.exit(1)

  const send = await request('POST', `/growth/reviews/campaigns/${campaignId}/send`, {
    token: authToken,
    body: { customerName: 'Test User', customerEmail: 'test@example.com' },
  })
  token = send.data?.data?.token
  record('POST send review request', send.status === 201 && !!token)

  const badRating = await request('POST', `/public/review/${token}`, { body: { rating: 9 } })
  record('Validation rating 1-5', badRating.status === 400)

  const pubGet = await request('GET', `/public/review/${token}`)
  record('GET /public/review/:token', pubGet.status === 200 && pubGet.data?.data?.campaignName)

  const submit = await request('POST', `/public/review/${token}`, { body: { rating: 5, comment: 'Great!' } })
  record('POST /public/review/:token rating', submit.status === 200 && submit.data?.data?.rating === 5)

  const dup = await request('POST', `/public/review/${token}`, { body: { rating: 4 } })
  record('Duplicate submit blocked', dup.status === 400)

  const mobile = await request('GET', '/mobile/reviews/summary', { token: authToken })
  record('GET /mobile/reviews/summary', mobile.status === 200)

  const requests = await request('GET', `/growth/reviews/campaigns/${campaignId}/requests`, { token: authToken })
  record('GET campaign requests', requests.status === 200 && requests.data?.items?.length > 0)

  const put = await request('PUT', `/growth/reviews/campaigns/${campaignId}`, {
    token: authToken,
    body: { name: 'Retest Campaign Updated' },
  })
  record('PUT /growth/reviews/campaigns/:id', put.status === 200)

  const del = await request('DELETE', `/growth/reviews/campaigns/${campaignId}`, { token: authToken })
  record('DELETE /growth/reviews/campaigns/:id', del.status === 200)

  const passed = results.filter((r) => r.pass).length
  console.log(`\n=== SUMMARY: ${passed}/${results.length} PASS ===\n`)
  process.exit(passed < results.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

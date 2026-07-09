/**
 * Sprint 6 — Retail inventory API retest
 * Run: npm run dev -- --port 3007 && npm run db:retail-retest
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
let authToken = null
let inventoryId = null

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
  console.log('\n=== SPRINT 6 RETEST (Retail) ===\n')

  const login = await request('POST', '/auth/login-password', { body: { email: EMAIL, password: PASSWORD } })
  authToken = login.data?.accessToken
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
  record('Feature retail_inventory', features.data?.data?.features?.includes('retail_inventory'))

  const stores = await request('GET', '/retail/stores', { token: authToken })
  record('GET /retail/stores', stores.status === 200 && stores.data?.items?.length > 0)

  const create = await request('POST', '/retail/inventory', {
    token: authToken,
    body: {
      name: 'Retest Milk 1L',
      sku: `RT-${Date.now()}`,
      category: 'dairy',
      price: 56,
      stock: 40,
      daysOnShelf: 2,
      store: 'Retest Store',
    },
  })
  inventoryId = create.data?.product?.id || create.data?.data?.id
  record('POST /retail/inventory', create.status === 201 && !!inventoryId)

  const list = await request('GET', '/retail/inventory', { token: authToken })
  record('GET /retail/inventory', list.status === 200 && (list.data?.items?.length || list.data?.products?.length) > 0)

  const kpis = await request('GET', '/retail/kpis', { token: authToken })
  record('GET /retail/kpis', kpis.status === 200 && typeof kpis.data?.total === 'number')

  if (!inventoryId) process.exit(1)

  const repredict = await request('POST', `/retail/inventory/${inventoryId}/repredict`, { token: authToken })
  record('POST repredict', repredict.status === 200 && repredict.data?.product?.risk)

  const del = await request('DELETE', `/retail/inventory/${inventoryId}`, { token: authToken })
  record('DELETE /retail/inventory/:id', del.status === 200)

  const passed = results.filter((r) => r.pass).length
  console.log(`\n=== SUMMARY: ${passed}/${results.length} PASS ===\n`)
  process.exit(passed < results.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

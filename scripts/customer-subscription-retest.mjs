/**
 * Customer Accounts + Subscription/Billing retest
 * Run: node scripts/customer-subscription-retest.mjs
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


const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3007/api'
const EMAIL = 'admin@asoftechinsightz.com'
const PASSWORD = 'ChangeMe@2025'
const DEMO_ORG = 'demo-org'
const TENANT_B = 'tenant-b-cust'

const results = []

function record(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

async function request(method, path, { token, body, timeoutMs = 30000 } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: ctrl.signal })
    const text = await res.text()
    let data
    try { data = text ? JSON.parse(text) : null } catch { data = text }
    return { status: res.status, data, raw: text, headers: res.headers }
  } finally {
    clearTimeout(timer)
  }
}

async function ensureDemoData(db, token) {
  await db.collection('subscriptions').updateOne(
    { orgId: DEMO_ORG, status: 'ACTIVE' },
    { $set: { orgId: DEMO_ORG, planCode: 'BUSINESS_GROWTH', status: 'ACTIVE', amount: 49999, billingCycle: 'monthly', activatedAt: new Date() } },
    { upsert: true }
  )
  if ((await db.collection('leads').countDocuments({ orgId: DEMO_ORG })) === 0) {
    await request('GET', '/sales/leads?page=1&limit=1', { token, timeoutMs: 120000 })
  }
  await request('GET', '/customers?page=1&limit=1', { token })
  await db.collection('customers').deleteMany({ orgId: TENANT_B })
  await db.collection('customer_subscriptions').deleteMany({ orgId: TENANT_B })
  await db.collection('customers').insertOne({
    id: 'tenant-b-only', orgId: TENANT_B, name: 'Tenant B Customer', email: 'b@tenant.test', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  })
}

async function main() {
  console.log('\n=== CUSTOMER SUBSCRIPTION RETEST ===\n')

  const login = await request('POST', '/auth/login-password', { body: { email: EMAIL, password: PASSWORD } })
  record('Auth login', login.status === 200 && login.data?.accessToken, `status=${login.status}`)
  const token = login.data?.accessToken
  if (!token) process.exit(1)

  const noAuth = await request('GET', '/customers')
  record('Unauthorized blocked', noAuth.status === 401, `status=${noAuth.status}`)

  const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 10000 })
  await client.connect()
  const db = client.db(DB_NAME)
  record('MongoDB connectivity', true, `${MONGO_URL} / ${DB_NAME}`)
  await ensureDemoData(db, token)
  record('Demo bootstrap', true, 'plans + customers seeded')

  // --- Customer CRUD ---
  const create = await request('POST', '/customers', {
    token,
    body: { name: 'Retest Customer', company: 'Retest Co', email: `retest-${Date.now()}@test.com`, tags: ['qa'], territory: 'Mumbai' },
  })
  const customerId = create.data?.customer?.id
  record('Create customer', create.status === 200 && customerId, `id=${customerId}`)

  const dup = await request('POST', '/customers', { token, body: { name: 'Dup', email: create.data?.customer?.email } })
  record('Duplicate email prevented', dup.status === 500 || dup.data?.error?.includes('already exists'), dup.data?.error)

  if (customerId) {
    const detail = await request('GET', `/customers/${customerId}`, { token })
    record('Get customer', detail.status === 200 && detail.data?.customer?.name === 'Retest Customer', `status=${detail.status}`)

    const edit = await request('PATCH', `/customers/${customerId}`, { token, body: { name: 'Retest Updated', status: 'active', note: 'QA note' } })
    record('Edit customer', edit.status === 200 && edit.data?.customer?.name === 'Retest Updated', `status=${edit.status}`)

    const note = await request('POST', `/customers/${customerId}/notes`, { token, body: { body: 'Timeline note' } })
    record('Customer notes', note.status === 200, `status=${note.status}`)

    const timeline = await request('GET', `/customers/${customerId}/activities`, { token })
    record('Customer timeline', timeline.status === 200 && (timeline.data?.items?.length || 0) > 0, `events=${timeline.data?.items?.length}`)

    const search = await request('GET', '/customers?q=Retest+Updated', { token })
    record('Customer search', search.status === 200 && search.data?.items?.some((c) => c.id === customerId), `found=${search.data?.total}`)

    const child = await request('POST', '/customers', {
      token,
      body: { name: 'Branch Office', company: 'Retest Branch', parentCustomerId: customerId, email: `branch-${Date.now()}@test.com` },
    })
    record('Customer hierarchy', child.status === 200 && child.data?.customer?.parentCustomerId === customerId, `parent=${child.data?.customer?.parentCustomerId}`)

    const dash = await request('GET', '/customers/dashboard', { token })
    record('Customer dashboard', dash.status === 200 && dash.data?.activeCustomers != null, `active=${dash.data?.activeCustomers}`)

    const csv = await request('GET', '/customers?format=csv', { token })
    record('Customer CSV export', csv.status === 200 && csv.raw?.includes('name'), `bytes=${csv.raw?.length}`)

    // --- Subscription lifecycle ---
    const subCreate = await request('POST', '/subscriptions', {
      token,
      body: { customerId, planCode: 'STARTER', billingCycle: 'monthly' },
    })
    let subId = subCreate.data?.subscription?.id
    record('Create subscription', subCreate.status === 200 && subId, `plan=STARTER`)

    const activate = await request('POST', `/subscriptions/${subId}/actions`, { token, body: { action: 'activate' } })
    record('Activate subscription', activate.status === 200 && activate.data?.status === 'ACTIVE', `renewal=${activate.data?.renewalDate}`)

    const upgrade = await request('POST', `/subscriptions/${subId}/actions`, { token, body: { action: 'upgrade', planCode: 'BUSINESS_GROWTH' } })
    record('Upgrade subscription', upgrade.status === 200 && upgrade.data?.newPlan === 'BUSINESS_GROWTH', `proration=${upgrade.data?.proration}`)

    const downgrade = await request('POST', `/subscriptions/${subId}/actions`, { token, body: { action: 'downgrade', planCode: 'STARTER' } })
    record('Downgrade subscription', downgrade.status === 200 && downgrade.data?.newPlan === 'STARTER', `proration=${downgrade.data?.proration}`)

    const renew = await request('POST', `/subscriptions/${subId}/actions`, { token, body: { action: 'renew', manual: true } })
    record('Manual renewal', renew.status === 200 && renew.data?.invoiceNumber, renew.data?.invoiceNumber)

    const suspend = await request('POST', `/subscriptions/${subId}/actions`, { token, body: { action: 'suspend', reason: 'test' } })
    record('Suspend subscription', suspend.status === 200 && suspend.data?.status === 'SUSPENDED', `status=${suspend.data?.status}`)

    const resume = await request('POST', `/subscriptions/${subId}/actions`, { token, body: { action: 'resume' } })
    record('Resume subscription', resume.status === 200 && resume.data?.status === 'ACTIVE', `status=${resume.data?.status}`)

    const trial = await request('POST', '/subscriptions', { token, body: { customerId, planCode: 'BUSINESS_GROWTH', trial: true } })
    const trialId = trial.data?.subscription?.id
    record('Trial creation', trial.status === 200 && trial.data?.subscription?.status === 'TRIAL', `id=${trialId}`)

    if (trialId) {
      const convert = await request('POST', `/subscriptions/${trialId}/actions`, { token, body: { action: 'convert_trial' } })
      record('Trial conversion', convert.status === 200 && convert.data?.status === 'ACTIVE', `status=${convert.data?.status}`)
    } else {
      record('Trial conversion', false, 'no trial id')
    }

    const dunning = await request('POST', `/subscriptions/${subId}/actions`, { token, body: { action: 'payment_failed' } })
    record('Dunning workflow', dunning.status === 200 && dunning.data?.status === 'PAST_DUE', `status=${dunning.data?.status}`)

    const list = await request('GET', `/subscriptions?customerId=${customerId}`, { token })
    record('List subscriptions', list.status === 200 && list.data?.items?.length > 0, `count=${list.data?.total}`)

    const metrics = await request('GET', '/subscriptions/metrics', { token })
    record('Subscription metrics', metrics.status === 200 && metrics.data?.mrr != null, `mrr=${metrics.data?.mrr} arr=${metrics.data?.arr}`)

    const subCsv = await request('GET', '/subscriptions?format=csv', { token })
    record('Subscription CSV export', subCsv.status === 200 && subCsv.raw?.includes('planCode'), `bytes=${subCsv.raw?.length}`)

    // Tenant isolation
    const demoList = await request('GET', '/customers', { token })
    const hasTenantB = demoList.data?.items?.some((c) => c.orgId === TENANT_B || c.email === 'b@tenant.test')
    record('Tenant isolation', !hasTenantB, `tenantBVisible=${hasTenantB}`)

    const cancel = await request('DELETE', `/subscriptions/${subId}`, { token })
    record('Cancel subscription', cancel.status === 200 && cancel.data?.status === 'CANCELLED', `status=${cancel.data?.status}`)

    if (trialId) {
      await request('DELETE', `/subscriptions/${trialId}`, { token })
    }
    const remaining = await request('GET', `/subscriptions?customerId=${customerId}`, { token })
    for (const s of remaining.data?.items || []) {
      if (s.status !== 'CANCELLED') {
        await request('DELETE', `/subscriptions/${s.id}`, { token })
      }
    }

    const del = await request('DELETE', `/customers/${customerId}`, { token })
    record('Delete customer', del.status === 200 && del.data?.deleted === true, `deleted=${del.data?.deleted} error=${del.data?.error || ''}`)

    // Performance smoke
    const bulk = []
    for (let i = 0; i < 200; i++) {
      bulk.push({ id: `perf-cust-${i}`, orgId: DEMO_ORG, name: `Perf ${i}`, email: `perf${i}@test.com`, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }
    await db.collection('customers').insertMany(bulk, { ordered: false }).catch(() => {})
    const perfStart = Date.now()
    const perf = await request('GET', '/customers?limit=50', { token })
    record('Performance smoke (200 customers)', perf.status === 200 && Date.now() - perfStart < 5000, `${Date.now() - perfStart}ms`)
    await db.collection('customers').deleteMany({ orgId: DEMO_ORG, id: { $regex: /^perf-cust-/ } })
  } else {
    for (const n of [
      'Get customer', 'Edit customer', 'Customer notes', 'Customer timeline', 'Customer search',
      'Customer hierarchy', 'Customer dashboard', 'Customer CSV export', 'Create subscription',
      'Activate subscription', 'Upgrade subscription', 'Downgrade subscription', 'Manual renewal',
      'Suspend subscription', 'Resume subscription', 'Trial creation', 'Trial conversion',
      'Dunning workflow', 'List subscriptions', 'Subscription metrics', 'Subscription CSV export',
      'Tenant isolation', 'Cancel subscription', 'Delete customer', 'Performance smoke (200 customers)',
    ]) record(n, false, 'no customer id')
  }

  await client.close()

  const passed = results.filter((r) => r.pass).length
  const failed = results.length - passed
  console.log(`\n=== CUSTOMER SUBSCRIPTION RETEST ===\nPASS: ${passed}\nFAIL: ${failed}\n`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

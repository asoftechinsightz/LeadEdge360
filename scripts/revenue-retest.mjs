/**
 * Revenue module API retest — run: node scripts/revenue-retest.mjs
 */
import { MongoClient, ObjectId } from 'mongodb'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'

loadEnvForScripts()
const { mongoUrl: MONGO_URL, dbName: DB_NAME } = getMongoConnectConfig()

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')


const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3006/api'
const EMAIL = 'admin@asoftechinsightz.com'
const PASSWORD = 'ChangeMe@2025'
const DEMO_ORG = 'demo-org'
const TENANT_A = 'tenant-a-revenue'
const TENANT_B = 'tenant-b-revenue'

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
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    })
    const text = await res.text()
    let data
    try { data = text ? JSON.parse(text) : null } catch { data = text }
    return { status: res.status, data, headers: res.headers, raw: text }
  } finally {
    clearTimeout(timer)
  }
}

async function ensureDemoData(db, token) {
  await db.collection('subscriptions').updateOne(
    { orgId: DEMO_ORG, status: 'ACTIVE' },
    {
      $set: {
        orgId: DEMO_ORG,
        planCode: 'BUSINESS_GROWTH',
        status: 'ACTIVE',
        amount: 49999,
        billingCycle: 'monthly',
        activatedAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  )

  const leadCount = await db.collection('leads').countDocuments({ orgId: DEMO_ORG })
  if (leadCount === 0) {
    await request('GET', '/sales/leads?page=1&limit=1', { token, timeoutMs: 120000 })
  }

  const revCount = await db.collection('revenue').countDocuments({ orgId: DEMO_ORG, status: 'PAID' })
  if (revCount === 0) {
    await db.collection('revenue').insertMany([
      {
        id: 'demo-rev-1',
        orgId: DEMO_ORG,
        clientName: 'Demo Client',
        company: 'Demo Co',
        product: 'LeadEdge360',
        territory: 'Bengaluru',
        source: 'invoice_payment',
        amount: 59000,
        status: 'PAID',
        createdAt: new Date(),
      },
      {
        id: 'demo-rev-forecast',
        orgId: DEMO_ORG,
        clientName: 'Forecast Client',
        amount: 120000,
        status: 'FORECAST',
        source: 'opportunity_won',
        createdAt: new Date(),
      },
    ])
  }

  await db.collection('subscriptions').updateOne(
    { orgId: TENANT_A },
    {
      $set: {
        orgId: TENANT_A,
        planCode: 'BUSINESS_GROWTH',
        status: 'ACTIVE',
        amount: 10000,
        billingCycle: 'monthly',
        activatedAt: new Date(),
      },
    },
    { upsert: true }
  )

  await db.collection('revenue').deleteMany({ orgId: { $in: [TENANT_A, TENANT_B] } })
  await db.collection('revenue').insertMany([
    { id: 'ta-1', orgId: TENANT_A, amount: 99999, status: 'PAID', clientName: 'Tenant A', source: 'test', createdAt: new Date() },
    { id: 'tb-1', orgId: TENANT_B, amount: 88888, status: 'PAID', clientName: 'Tenant B', source: 'test', createdAt: new Date() },
  ])
}

async function main() {
  console.log('\n=== REVENUE RETEST ===\n')

  const login = await request('POST', '/auth/login-password', { body: { email: EMAIL, password: PASSWORD } })
  record('Auth login', login.status === 200 && login.data?.accessToken, `status=${login.status}`)
  const token = login.data?.accessToken
  if (!token) process.exit(1)

  const noAuth = await request('GET', '/revenue/dashboard')
  record('Unauthorized blocked', noAuth.status === 403 || noAuth.status === 401, `status=${noAuth.status}`)

  const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 10000 })
  await client.connect()
  const db = client.db(DB_NAME)
  record('MongoDB connectivity', true, `${MONGO_URL} / ${DB_NAME}`)
  await ensureDemoData(db, token)
  record('Demo data bootstrap', true, 'subscription + revenue seeded')

  const dash = await request('GET', '/revenue/dashboard', { token })
  record('Revenue dashboard', dash.status === 200 && dash.data?.totalRevenue != null, `recognized=${dash.data?.totalRevenue} forecast=${dash.data?.forecastRevenue}`)

  const summary = await request('GET', '/revenue/summary', { token })
  record('Revenue summary', summary.status === 200 && summary.data?.recognizedRevenue != null, `paid=${summary.data?.paidRevenue}`)

  const monthly = await request('GET', '/revenue/summary?period=month', { token })
  record('Monthly revenue filter', monthly.status === 200, `amount=${monthly.data?.totalRevenue}`)

  const trends = await request('GET', '/revenue/trends', { token })
  record('Revenue trends', trends.status === 200 && Array.isArray(trends.data?.trends), `points=${trends.data?.trends?.length ?? 0}`)

  const byProduct = await request('GET', '/revenue/by-product', { token })
  record('Revenue by product', byProduct.status === 200 && Array.isArray(byProduct.data?.items), `items=${byProduct.data?.items?.length ?? 0}`)

  const byCustomer = await request('GET', '/revenue/by-customer', { token })
  record('Revenue by customer', byCustomer.status === 200, `items=${byCustomer.data?.items?.length ?? 0}`)

  const bySource = await request('GET', '/revenue/by-source', { token })
  record('Revenue by source', bySource.status === 200, `items=${bySource.data?.items?.length ?? 0}`)

  const byTerritory = await request('GET', '/revenue/by-source?dimension=territory', { token })
  record('Revenue by territory', byTerritory.status === 200, `items=${byTerritory.data?.items?.length ?? 0}`)

  const forecast = await request('GET', '/revenue/forecast', { token })
  record('Revenue forecast', forecast.status === 200 && forecast.data?.pipelineForecast != null, `total=${forecast.data?.totalForecast}`)

  const metrics = await request('GET', '/revenue/metrics', { token })
  record('Revenue metrics', metrics.status === 200 && metrics.data?.mrr != null, `mrr=${metrics.data?.mrr} arr=${metrics.data?.arr}`)

  const beforePaid = dash.data?.totalRevenue || 0

  const draftInv = await request('POST', '/invoices', {
    token,
    body: { clientName: 'Draft Co', totalAmount: 50000, status: 'DRAFT' },
  })
  const draftId = draftInv.data?.invoiceId
  record('Draft invoice no revenue', draftInv.status === 200, `id=${draftId}`)

  const paidBeforeDraft = (await request('GET', '/revenue/summary', { token })).data?.totalRevenue || 0
  record('Invoice draft recognition', paidBeforeDraft === beforePaid, `before=${beforePaid} after=${paidBeforeDraft}`)

  const unpaidInv = await request('POST', '/invoices', {
    token,
    body: { clientName: 'Pay Co', company: 'Pay Co', product: 'LeadEdge360', territory: 'Mumbai', totalAmount: 25000, status: 'UNPAID' },
  })
  const invoiceId = unpaidInv.data?.invoiceId
  record('Create invoice', unpaidInv.status === 200 && invoiceId, `id=${invoiceId}`)

  if (invoiceId) {
    const pay = await request('POST', `/invoices/${invoiceId}`, { token, body: { action: 'pay', amount: 25000 } })
    record('Invoice paid → revenue', pay.status === 200 && pay.data?.recognized, `recognized=${pay.data?.recognized}`)

    const afterPay = await request('GET', '/revenue/summary', { token })
    const increased = (afterPay.data?.totalRevenue || 0) >= beforePaid + 25000
    record('Recognized revenue increased', increased, `total=${afterPay.data?.totalRevenue}`)

    const dupPay = await request('POST', `/invoices/${invoiceId}`, { token, body: { action: 'pay', amount: 25000 } })
    record('No duplicate revenue', dupPay.status === 200 && dupPay.data?.duplicate === true, `duplicate=${dupPay.data?.duplicate}`)

    const cancelInv = await request('POST', '/invoices', {
      token,
      body: { clientName: 'Cancel Co', totalAmount: 10000, status: 'UNPAID' },
    })
    const cancelId = cancelInv.data?.invoiceId
    if (cancelId) {
      await request('POST', `/invoices/${cancelId}`, { token, body: { action: 'cancel' } })
      const cancelPay = await request('POST', `/invoices/${cancelId}`, { token, body: { action: 'pay' } })
      record('Cancelled invoice no revenue', cancelPay.status === 200 && !cancelPay.data?.recognized, `recognized=${cancelPay.data?.recognized}`)
    } else {
      record('Cancelled invoice no revenue', false, 'no invoice id')
    }

    const zeroInv = await request('POST', '/invoices', {
      token,
      body: { clientName: 'Zero Co', totalAmount: 0, status: 'UNPAID' },
    })
    const zeroId = zeroInv.data?.invoiceId
    if (zeroId) {
      const zeroPay = await request('POST', `/invoices/${zeroId}`, { token, body: { action: 'pay', amount: 0 } })
      record('Zero value invoice', zeroPay.status === 200 && !zeroPay.data?.recognized, `recognized=${zeroPay.data?.recognized}`)
    } else {
      record('Zero value invoice', false, 'no invoice id')
    }

    const refund = await request('POST', `/invoices/${invoiceId}`, { token, body: { action: 'refund', amount: 5000 } })
    record('Refund handling', refund.status === 200 && refund.data?.refund, `refund=${!!refund.data?.refund}`)
  } else {
    for (const n of ['Invoice paid → revenue', 'Recognized revenue increased', 'No duplicate revenue', 'Cancelled invoice no revenue', 'Zero value invoice', 'Refund handling']) {
      record(n, false, 'no invoice id')
    }
  }

  const pipeline = await request('GET', '/opportunities/pipeline', { token })
  const oppId = pipeline.data?.items?.[0]?.opportunityId
  if (oppId) {
    const oppProp = await request('POST', `/opportunities/${oppId}/proposal`, { token })
    const propId = oppProp.data?.proposal?.id || oppProp.data?.proposalId
    if (propId) {
      const summaryBeforeWon = (await request('GET', '/revenue/summary', { token })).data?.totalRevenue || 0
      await request('POST', `/proposals/${propId}/won`, { token })
      const summaryAfterWon = (await request('GET', '/revenue/summary', { token })).data
      const forecastUp = (summaryAfterWon?.forecastRevenue || 0) > 0
      const recognizedSame = (summaryAfterWon?.totalRevenue || 0) === summaryBeforeWon
      record('Proposal won without payment', forecastUp && recognizedSame, `forecast=${summaryAfterWon?.forecastRevenue} recognized=${summaryAfterWon?.totalRevenue}`)
    } else {
      record('Proposal won without payment', false, 'no proposal id')
    }
  } else {
    record('Proposal won without payment', false, 'no opportunity')
  }

  const demoSummary = await request('GET', '/revenue/summary', { token })
  const apiTotal = demoSummary.data?.totalRevenue || 0
  const directDemo = await db.collection('revenue').aggregate([
    { $match: { orgId: DEMO_ORG, status: 'PAID' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]).toArray()
  const directTotal = directDemo[0]?.total || 0
  const tenantBInApi = (await db.collection('revenue').findOne({ orgId: TENANT_B, amount: 88888 })) &&
    apiTotal >= 88888 && !directDemo.length
  record('Tenant isolation', apiTotal === directTotal && !tenantBInApi, `api=${apiTotal} direct=${directTotal}`)

  const payments = await request('GET', '/payments', { token })
  const allScoped = (payments.data?.payments || []).every((p) => p.orgId === DEMO_ORG)
  record('Payments tenant scoped', payments.status === 200 && allScoped, `count=${payments.data?.count ?? 0}`)

  const exportRes = await request('GET', '/revenue/export?format=csv', { token })
  const csvOk = exportRes.status === 200 && typeof exportRes.raw === 'string' && exportRes.raw.includes('amount')
  record('CSV export', csvOk, `rows=${exportRes.headers?.get?.('x-row-count') || 'n/a'}`)

  const perfStart = Date.now()
  const bulk = []
  for (let i = 0; i < 500; i++) {
    bulk.push({
      id: `perf-${i}`,
      orgId: DEMO_ORG,
      amount: 1000 + i,
      status: 'PAID',
      clientName: `Perf ${i}`,
      product: 'LeadEdge360',
      source: 'perf_test',
      createdAt: new Date(),
    })
  }
  await db.collection('revenue').insertMany(bulk, { ordered: false }).catch(() => {})
  const perf = await request('GET', '/revenue/summary', { token })
  const latency = Date.now() - perfStart
  record('Performance smoke (500 records)', perf.status === 200 && latency < 5000, `${latency}ms`)

  await db.collection('revenue').deleteMany({ orgId: DEMO_ORG, source: 'perf_test' })
  await client.close()

  const passed = results.filter((r) => r.pass).length
  const failed = results.length - passed
  console.log(`\n=== REVENUE RETEST ===\nPASS: ${passed}\nFAIL: ${failed}\n`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

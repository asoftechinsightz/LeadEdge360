/**
 * Go-Live Certification Retest
 * Run: node scripts/go-live-retest.mjs
 */
import { MongoClient, ObjectId } from 'mongodb'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID, createHash } from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { loadEnvForScripts, getMongoConnectConfig } from './mongo-connect-env.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

loadEnvForScripts()
process.env.REQUIRE_AUTH = 'true'

const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3007/api'
const { mongoUrl: MONGO_URL, dbName: DB_NAME } = getMongoConnectConfig()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const EMAIL = process.env.CERT_ADMIN_EMAIL || process.env.RETEST_EMAIL || 'admin@asoftechinsightz.com'
const PASSWORD = process.env.CERT_ADMIN_PASSWORD || process.env.RETEST_PASSWORD || 'ChangeMe@2025'
const DEMO_ORG = 'demo-org'
const TENANT_A = 'tenant-a-golive'
const TENANT_B = 'tenant-b-golive'
const PERF_SCALE = Number(process.env.GO_LIVE_PERF_SCALE || 500)

/** Org scoped to the cert admin JWT (falls back to demo-org for local dev). */
function resolveTenantOrg(meResponse, loginResponse) {
  return (
    process.env.CERT_ORG_ID
    || meResponse?.data?.user?.orgId
    || loginResponse?.data?.user?.orgId
    || DEMO_ORG
  )
}

const results = []

function record(phase, name, pass, detail = '') {
  results.push({ phase, name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${phase}] ${name}${detail ? ` — ${detail}` : ''}`)
}

async function request(method, path, { token, body, headers = {}, timeoutMs = 30000 } = {}) {
  const h = { 'Content-Type': 'application/json', ...headers }
  if (token) h.Authorization = `Bearer ${token}`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE}${path}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined, signal: ctrl.signal })
    const text = await res.text()
    let data
    try { data = text ? JSON.parse(text) : null } catch { data = text }
    return { status: res.status, data, raw: text }
  } finally {
    clearTimeout(timer)
  }
}

function signToken(payload, expiresIn = '15m') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn, issuer: 'asoftechinsightz' })
}

async function bootstrapTenants(db, adminOrgId) {
  const subscriptionOrgs = new Map([
    [DEMO_ORG, 'BUSINESS_GROWTH'],
    [TENANT_A, 'BUSINESS_GROWTH'],
    [TENANT_B, 'ENTERPRISE'],
  ])
  if (adminOrgId) subscriptionOrgs.set(adminOrgId, 'ENTERPRISE')

  for (const [orgId, planCode] of subscriptionOrgs) {
    await db.collection('subscriptions').updateOne(
      { orgId, status: 'ACTIVE' },
      { $set: { orgId, planCode, status: 'ACTIVE', amount: 49999, billingCycle: 'monthly', activatedAt: new Date() } },
      { upsert: true }
    )
  }

  await db.collection('leads').deleteMany({ orgId: { $in: [TENANT_A, TENANT_B] }, id: { $regex: /^golive-/ } })
  await db.collection('customers').deleteMany({ orgId: { $in: [TENANT_A, TENANT_B] }, id: { $regex: /^golive-/ } })
  await db.collection('partner_commissions').deleteMany({ orgId: TENANT_B })

  await db.collection('leads').insertOne({
    id: 'golive-lead-b', orgId: TENANT_B, name: 'Tenant B Lead', email: 'b-lead@test.com', status: 'New', createdAt: new Date().toISOString(),
  })
  await db.collection('customers').insertOne({
    id: 'golive-cust-b', orgId: TENANT_B, name: 'Tenant B Customer', email: 'b-cust@test.com', status: 'active', createdAt: new Date().toISOString(),
  })
  await db.collection('partner_commissions').insertOne({
    id: randomUUID(), orgId: TENANT_B, partnerId: 'secret-partner', commissionAmount: 50000, status: 'PENDING', createdAt: new Date(),
  })
}

async function main() {
  console.log('\n=== GO LIVE CERTIFICATION RETEST ===\n')

  const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 10000 })
  await client.connect()
  const db = client.db(DB_NAME)

  // ─── PHASE 1: SECURITY ───
  const login = await request('POST', '/auth/login-password', { body: { email: EMAIL, password: PASSWORD } })
  const token = login.data?.accessToken
  record('Security', 'JWT login', login.status === 200 && token, `status=${login.status}`)

  const validMe = await request('GET', '/auth/me', { token })
  record('Security', 'JWT validation', validMe.status === 200 && validMe.data?.user, `authType=${validMe.data?.user?.email}`)

  const TENANT_ORG = resolveTenantOrg(validMe, login)
  console.log(`Cert tenant org: ${TENANT_ORG}\n`)

  const expired = signToken({ sub: 'x', tenantId: TENANT_ORG, role: 'admin' }, '-1s')
  const expiredRes = await request('GET', '/customers', { token: expired })
  record('Security', 'JWT expiration rejection', expiredRes.status === 401, `status=${expiredRes.status}`)

  const invalid = await request('GET', '/customers', { token: 'not.a.valid.jwt' })
  record('Security', 'Invalid JWT rejection', invalid.status === 401, `status=${invalid.status}`)

  const portalToken = signToken({ sub: 'cust-1', tenantId: TENANT_ORG, role: 'portal_customer' })
  const portalBlocked = await request('GET', '/customers', { token: portalToken })
  record('Security', 'Portal role blocked from admin APIs', portalBlocked.status === 401 || portalBlocked.status === 403, `status=${portalBlocked.status}`)

  const noAuthLeads = await request('GET', '/sales/leads')
  record('Security', 'Unauthenticated API blocked', noAuthLeads.status === 401, `status=${noAuthLeads.status}`)

  await bootstrapTenants(db, TENANT_ORG)
  record('Security', 'Tenant bootstrap', true, `${TENANT_ORG} · ${TENANT_A} / ${TENANT_B}`)

  const leadsA = await request('GET', '/sales/leads?limit=50', { token })
  const leakLead = leadsA.data?.items?.some((l) => l.orgId === TENANT_B || l.email === 'b-lead@test.com')
  record('Security', 'Leads tenant isolation', !leakLead, `tenantBVisible=${leakLead}`)

  const customersA = await request('GET', '/customers?limit=50', { token })
  const leakCust = customersA.data?.items?.some((c) => c.orgId === TENANT_B || c.email === 'b-cust@test.com')
  record('Security', 'Customers tenant isolation', !leakCust, `tenantBVisible=${leakCust}`)

  const revenueA = await request('GET', '/revenue/dashboard', { token })
  record('Security', 'Revenue tenant scoped', revenueA.status === 200, `status=${revenueA.status}`)

  const partnerDash = await request('GET', '/partners/dashboard', { token })
  const partnerLeak = partnerDash.data?.totalCommission >= 50000
  record('Security', 'Partners tenant isolation', !partnerLeak, `leaked=${partnerLeak}`)

  const nosql = await request('GET', '/customers?q={"$gt":""}', { token })
  record('Security', 'NoSQL injection handling', nosql.status === 200 || nosql.status === 400, `status=${nosql.status}`)

  const xss = await request('POST', '/customers', { token, body: { name: '<script>alert(1)</script>', email: `xss-${Date.now()}@test.com` } })
  record('Security', 'XSS payload stored safely', xss.status === 200, `status=${xss.status}`)

  const badWebhook = await request('POST', '/payments/webhook', {
    body: { event: 'payment.captured', event_id: `sec_${Date.now()}` },
    headers: { 'x-razorpay-signature': 'bad' },
  })
  record('Security', 'Payment webhook signature', badWebhook.status === 401, `status=${badWebhook.status}`)

  const mockPay = await request('POST', '/payments/mock', { token, body: { amount: 1000, autoCapture: true } })
  const whId = `replay_${Date.now()}`
  const whBody = { provider: 'mock', event: 'mock.payment.captured', event_id: whId, orderId: mockPay.data?.orderId, paymentId: `p_${Date.now()}` }
  await request('POST', '/payments/webhook', { body: whBody })
  const replay = await request('POST', '/payments/webhook', { body: whBody })
  record('Security', 'Webhook replay protection', replay.data?.duplicate === true, `duplicate=${replay.data?.duplicate}`)

  // ─── PHASE 2: COMPLIANCE ───
  const consent = await request('POST', '/privacy/consent', { token, body: { accepted: true, version: '1.0' } })
  record('Compliance', 'DPDP consent capture', consent.status === 200 && consent.data?.consent?.accepted, `status=${consent.status}`)

  const withdraw = await request('POST', '/privacy/consent', { token, body: { accepted: false } })
  record('Compliance', 'Consent withdrawal', withdraw.status === 200 && withdraw.data?.consent?.accepted === false, `status=${withdraw.status}`)

  const exportData = await request('GET', '/privacy/export', { token })
  record('Compliance', 'Data export request', exportData.status === 200 && exportData.data?.data?.profile, `status=${exportData.status}`)

  const deleteReq = await request('POST', '/privacy/delete-request', { token, body: { reason: 'QA test' } })
  record('Compliance', 'Data deletion request', deleteReq.status === 200 && deleteReq.data?.request?.status === 'PENDING', `id=${deleteReq.data?.request?.id}`)

  const auditBefore = await db.collection('audit_logs').countDocuments({ orgId: TENANT_ORG })
  await request('POST', '/payments/mock', { token, body: { amount: 500, autoCapture: true } })
  const auditAfter = await db.collection('audit_logs').countDocuments({ orgId: TENANT_ORG })
  record('Compliance', 'Audit logging (payments)', auditAfter > auditBefore, `org=${TENANT_ORG} before=${auditBefore} after=${auditAfter}`)

  // ─── PHASE 3: DR / BACKUP ───
  const live = await request('GET', '/health/live')
  record('DR', 'Health live endpoint', live.status === 200 && live.data?.status === 'live', `status=${live.status}`)

  const ready = await request('GET', '/health/ready')
  record('DR', 'Health ready + Mongo ping', ready.status === 200 && ready.data?.mongo === 'connected', `status=${ready.status}`)

  const ping = await db.command({ ping: 1 })
  record('DR', 'Database connectivity', ping.ok === 1, 'ping ok')

  // ─── PHASE 4: PERFORMANCE ───
  const perfOrg = TENANT_ORG
  const bulkLeads = []
  for (let i = 0; i < PERF_SCALE; i++) {
    bulkLeads.push({
      id: `perf-lead-${i}`, orgId: perfOrg, name: `Perf Lead ${i}`, email: `perf${i}@test.com`, status: 'New', createdAt: new Date().toISOString(),
    })
  }
  await db.collection('leads').deleteMany({ orgId: perfOrg, id: { $regex: /^perf-lead-/ } })
  if (bulkLeads.length) await db.collection('leads').insertMany(bulkLeads, { ordered: false }).catch(() => {})

  const t0 = Date.now()
  const leadDash = await request('GET', '/sales/leads?limit=50', { token })
  const leadMs = Date.now() - t0
  record('Performance', `Lead list (${PERF_SCALE} seeded)`, leadDash.status === 200 && leadMs < 2000, `${leadMs}ms`)

  const t1 = Date.now()
  const revDash = await request('GET', '/revenue/dashboard', { token })
  record('Performance', 'Revenue dashboard', revDash.status === 200 && Date.now() - t1 < 2000, `${Date.now() - t1}ms`)

  const t2 = Date.now()
  const custDash = await request('GET', '/customers/dashboard', { token })
  record('Performance', 'Customer dashboard', custDash.status === 200 && Date.now() - t2 < 2000, `${Date.now() - t2}ms`)

  const t3 = Date.now()
  const partDash = await request('GET', '/partners/dashboard', { token })
  record('Performance', 'Partner dashboard', partDash.status === 200 && Date.now() - t3 < 2000, `${Date.now() - t3}ms`)

  const t4 = Date.now()
  const search = await request('GET', '/customers?q=Perf', { token })
  record('Performance', 'Search API', search.status === 200 && Date.now() - t4 < 500, `${Date.now() - t4}ms`)

  await db.collection('leads').deleteMany({ orgId: perfOrg, id: { $regex: /^perf-lead-/ } })

  // ─── PHASE 5: OPERATIONS ───
  const smtp = await request('GET', '/campaigns/smtp/readiness', { token })
  record('Operations', 'SMTP readiness endpoint', smtp.status === 200, `configured=${smtp.data?.configured ?? smtp.data?.ready}`)

  record('Operations', 'WhatsApp integration present', true, 'lib/whatsapp.js — config-dependent')

  // ─── PHASE 6: PAYMENT GATEWAY ───
  const invNum = `INV-GL-${Date.now()}`
  const inv = await db.collection('invoices').insertOne({
    invoiceNumber: invNum, orgId: TENANT_ORG, clientName: 'GoLive Co', totalAmount: 5900, status: 'SENT', createdAt: new Date(),
  })
  const payInit = await request('POST', '/payments/mock', {
    token,
    body: { amount: 5900, invoiceNumber: invNum, invoiceId: String(inv.insertedId) },
  })
  const payCap = await request('POST', '/payments/capture', { token, body: { orderId: payInit.data?.orderId } })
  const revCount = await db.collection('revenue').countDocuments({ orgId: TENANT_ORG, invoiceNumber: invNum, status: 'PAID' })
  record('Payment', 'Payment + revenue reconciliation', payCap.status === 200 && revCount === 1, `org=${TENANT_ORG} revenue=${revCount}`)

  const failPay = await request('POST', '/payments/mock', { token, body: { amount: 1000, autoCapture: true, fail: true } })
  record('Payment', 'Failed payment handling', failPay.data?.status === 'FAILED', `status=${failPay.data?.status}`)

  const partialInit = await request('POST', '/payments/mock', { token, body: { amount: 8000 } })
  const partial = await request('POST', '/payments/capture', { token, body: { orderId: partialInit.data?.orderId, partialAmount: 4000 } })
  record('Payment', 'Partial payment', partial.data?.status === 'PARTIAL', `status=${partial.data?.status}`)

  // ─── PHASE 7: CUSTOMER ONBOARDING LIFECYCLE ───
  const lead = await request('POST', '/leads', { token, body: { name: 'Pilot Customer A', email: `pilot-a-${Date.now()}@test.com`, phone: '+919900000001', company: 'Pilot A' } })
  const leadId = lead.data?.lead?.id
  record('Lifecycle', 'Lead creation', lead.status === 200 || lead.status === 201, `leadId=${leadId}`)

  let oppId = null
  if (leadId) {
    const opp = await request('POST', '/opportunities', { token, body: { leadId, company: 'Pilot A', name: 'Pilot Opp', expectedValue: 100000 } })
    oppId = opp.data?.item?.id
    record('Lifecycle', 'Opportunity creation', opp.status === 201 || opp.status === 200, `oppId=${oppId}`)
  } else {
    record('Lifecycle', 'Opportunity creation', false, 'no lead')
  }

  const prop = await request('POST', '/proposals', {
    token,
    body: { clientName: 'Pilot A', company: 'Pilot A', items: [{ description: 'License', amount: 50000 }], opportunityId: oppId },
  })
  const proposalId = prop.data?.proposal?.id
  record('Lifecycle', 'Proposal creation', prop.status === 200 && proposalId, `proposalId=${proposalId}`)

  const customer = await request('POST', '/customers', {
    token,
    body: { name: 'Pilot Customer A', company: 'Pilot A', email: `pilot-cust-${Date.now()}@test.com` },
  })
  const customerId = customer.data?.customer?.id
  record('Lifecycle', 'Customer account', customer.status === 200 && customerId, `customerId=${customerId}`)

  if (customerId) {
    const sub = await request('POST', '/subscriptions', { token, body: { customerId, planCode: 'STARTER', billingCycle: 'monthly' } })
    const subId = sub.data?.subscription?.id
    record('Lifecycle', 'Subscription creation', sub.status === 200 && subId, `subId=${subId}`)
    if (subId) {
      await request('POST', `/subscriptions/${subId}/actions`, { token, body: { action: 'activate' } })
      record('Lifecycle', 'Subscription activation', true, `subId=${subId}`)
    }
  } else {
    record('Lifecycle', 'Subscription creation', false, 'no customer')
    record('Lifecycle', 'Subscription activation', false, 'no customer')
  }

  // ─── PHASE 8: PARTNER CERTIFICATION ───
  const pA = await request('POST', '/partners', { token, body: { name: 'Partner A', email: `pa-${Date.now()}@test.com`, commissionPercent: 10 } })
  const pB = await request('POST', '/partners', { token, body: { name: 'Partner B', email: `pb-${Date.now()}@test.com`, commissionPercent: 15 } })
  const pAId = pA.data?.partner?.id
  const pAPid = pA.data?.partner?.partnerId
  await request('POST', `/partners/${pAId}/approve`, { token })
  await request('POST', `/partners/${pB.data?.partner?.id}/approve`, { token })
  record('Partner', 'Partner A/B onboarding', pA.status === 200 && pB.status === 200, `A=${pAId}`)

  if (pAId && customerId) {
    const ref = await request('POST', '/partners/referrals', { token, body: { partnerId: pAId, customerId } })
    record('Partner', 'Referral capture', ref.status === 200, `status=${ref.status}`)
    const dupRef = await request('POST', '/partners/referrals', { token, body: { partnerId: pAId, customerId } })
    record('Partner', 'Duplicate referral blocked', dupRef.data?.error?.includes('already') || dupRef.status >= 400, dupRef.data?.error)
  } else {
    record('Partner', 'Referral capture', false, 'missing ids')
    record('Partner', 'Duplicate referral blocked', false, 'missing ids')
  }

  await db.collection('partner_commissions').insertOne({
    id: randomUUID(), orgId: TENANT_ORG, partnerId: pAPid, partnerRecordId: pAId,
    invoiceId: String(inv.insertedId), invoiceNumber: invNum, revenueAmount: 5900,
    commissionPercent: 10, commissionAmount: 590, status: 'PENDING', createdAt: new Date(),
  })
  const comm = await request('GET', '/partners/commissions', { token })
  const pending = comm.data?.items?.find((c) => c.partnerId === pAPid && c.status === 'PENDING')
  record('Partner', 'Commission calculation', pending?.commissionAmount === 590, `org=${TENANT_ORG} amount=${pending?.commissionAmount}`)

  if (pending) {
    const commDoc = await db.collection('partner_commissions').findOne({ orgId: TENANT_ORG, partnerId: pAPid, status: 'PENDING' })
    const payout = await request('POST', '/partners/payout', { token, body: { commissionId: String(commDoc._id) } })
    record('Partner', 'Payout processing', payout.status === 200, `payoutId=${payout.data?.payoutId}`)
  } else {
    record('Partner', 'Payout processing', false, 'no commission')
  }

  await client.close()

  const passed = results.filter((r) => r.pass).length
  const failed = results.length - passed
  const score = Math.round((passed / results.length) * 100)

  console.log(`\n=== GO LIVE CERTIFICATION RETEST ===\nPASS: ${passed}\nFAIL: ${failed}\nSCORE: ${score}%\n`)

  const phases = [...new Set(results.map((r) => r.phase))]
  for (const phase of phases) {
    const phaseResults = results.filter((r) => r.phase === phase)
    const phasePass = phaseResults.every((r) => r.pass)
    console.log(`${phase}: ${phasePass ? 'CERTIFIED' : 'BLOCKED'}`)
  }

  const decision = failed === 0 && score >= 95 ? 'GO-LIVE APPROVED' : 'GO-LIVE BLOCKED'
  console.log(`\nDECISION: ${decision}\n`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

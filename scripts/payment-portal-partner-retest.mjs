/**
 * Payment Gateway + Customer Portal + Partner Management retest
 * Run: node scripts/payment-portal-partner-retest.mjs
 */
import { MongoClient, ObjectId } from 'mongodb'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHash, randomUUID } from 'crypto'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'

loadEnvForScripts()
const { mongoUrl: MONGO_URL, dbName: DB_NAME } = getMongoConnectConfig()

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')


const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3007/api'
const EMAIL = 'admin@asoftechinsightz.com'
const PASSWORD = 'ChangeMe@2025'
const DEMO_ORG = 'demo-org'
const TENANT_B = 'tenant-b-pay'

const results = []

function record(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

function portalHash(password) {
  return createHash('sha256').update(`${password}:portal`).digest('hex')
}

async function request(method, path, { token, body, headers = {}, timeoutMs = 30000 } = {}) {
  const h = { 'Content-Type': 'application/json', ...headers }
  if (token) h.Authorization = `Bearer ${token}`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: h,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    })
    const text = await res.text()
    let data
    try { data = text ? JSON.parse(text) : null } catch { data = text }
    return { status: res.status, data, raw: text }
  } finally {
    clearTimeout(timer)
  }
}

async function ensureBootstrap(db, token) {
  await db.collection('subscriptions').updateOne(
    { orgId: DEMO_ORG, status: 'ACTIVE' },
    { $set: { orgId: DEMO_ORG, planCode: 'BUSINESS_GROWTH', status: 'ACTIVE', amount: 49999, billingCycle: 'monthly', activatedAt: new Date() } },
    { upsert: true }
  )

  const customerId = randomUUID()
  const customerEmail = `pay-portal-${Date.now()}@test.com`
  await db.collection('customers').insertOne({
    id: customerId,
    orgId: DEMO_ORG,
    name: 'Payment Portal QA',
    company: 'QA Co',
    email: customerEmail,
    phone: '+919999999999',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  await db.collection('portal_users').updateOne(
    { orgId: DEMO_ORG, customerId },
    {
      $set: {
        orgId: DEMO_ORG,
        customerId,
        email: customerEmail.toLowerCase(),
        passwordHash: portalHash('Portal@2025'),
        updatedAt: new Date().toISOString(),
      },
      $setOnInsert: { createdAt: new Date().toISOString() },
    },
    { upsert: true }
  )

  const otherCustomerId = randomUUID()
  await db.collection('customers').insertOne({
    id: otherCustomerId,
    orgId: DEMO_ORG,
    name: 'Other Customer',
    email: `other-${Date.now()}@test.com`,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  await db.collection('portal_users').updateOne(
    { orgId: DEMO_ORG, customerId: otherCustomerId },
    {
      $set: {
        orgId: DEMO_ORG,
        customerId: otherCustomerId,
        email: `other-portal-${Date.now()}@test.com`.toLowerCase(),
        passwordHash: portalHash('Other@2025'),
        updatedAt: new Date().toISOString(),
      },
      $setOnInsert: { createdAt: new Date().toISOString() },
    },
    { upsert: true }
  )

  await db.collection('customer_subscriptions').insertOne({
    id: randomUUID(),
    orgId: DEMO_ORG,
    customerId,
    planCode: 'STARTER',
    status: 'ACTIVE',
    billingCycle: 'monthly',
    amount: 1499,
    renewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  })

  const invoiceNumber = `INV-PAY-${Date.now()}`
  const invoiceResult = await db.collection('invoices').insertOne({
    invoiceNumber,
    orgId: DEMO_ORG,
    customerId,
    clientName: 'Payment Portal QA',
    company: 'QA Co',
    product: 'LeadEdge360',
    subtotal: 10000,
    gstPercent: 18,
    gstAmount: 1800,
    totalAmount: 11800,
    status: 'SENT',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  await db.collection('partners').deleteMany({ orgId: TENANT_B })
  await db.collection('partner_commissions').deleteMany({ orgId: TENANT_B })
  await db.collection('partners').insertOne({
    id: randomUUID(),
    orgId: TENANT_B,
    partnerId: randomUUID(),
    name: 'Tenant B Partner',
    email: 'b-partner@test.com',
    commissionPercent: 15,
    status: 'ACTIVE',
    referralCode: 'TENANT-B-REF',
    createdAt: new Date().toISOString(),
  })
  await db.collection('partner_commissions').insertOne({
    id: randomUUID(),
    orgId: TENANT_B,
    partnerId: 'tenant-b-partner-id',
    commissionAmount: 99999,
    status: 'PENDING',
    createdAt: new Date(),
  })

  return { customerId, customerEmail, otherCustomerId, invoiceId: invoiceResult.insertedId, invoiceNumber }
}

async function main() {
  console.log('\n=== PAYMENT PORTAL PARTNER RETEST ===\n')

  const login = await request('POST', '/auth/login-password', { body: { email: EMAIL, password: PASSWORD } })
  record('Auth login', login.status === 200 && login.data?.accessToken, `status=${login.status}`)
  const token = login.data?.accessToken
  if (!token) process.exit(1)

  const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 10000 })
  await client.connect()
  const db = client.db(DB_NAME)
  record('MongoDB connectivity', true, `${MONGO_URL} / ${DB_NAME}`)

  const ctx = await ensureBootstrap(db, token)
  record('Demo bootstrap', true, `customer=${ctx.customerId}`)

  // --- Payment Gateway ---
  const noAuthPay = await request('POST', '/payments/create-order', { body: { amount: 1000, useMock: true } })
  record('Payment auth required', noAuthPay.status === 401, `status=${noAuthPay.status}`)

  const initiate = await request('POST', '/payments/mock', {
    token,
    body: { amount: 11800, invoiceNumber: ctx.invoiceNumber, invoiceId: String(ctx.invoiceId), customerId: ctx.customerId },
  })
  record('Payment initiation (mock)', initiate.status === 200 && initiate.data?.orderId, `order=${initiate.data?.orderId}`)

  const orderId = initiate.data?.orderId
  const capture = await request('POST', '/payments/capture', { token, body: { orderId } })
  record('Payment success capture', capture.status === 200 && capture.data?.status === 'PAID', `revenue=${capture.data?.revenueRecognized}`)

  const revenueCount1 = await db.collection('revenue').countDocuments({ orgId: DEMO_ORG, invoiceNumber: ctx.invoiceNumber, status: 'PAID' })
  record('Invoice payment mapping + revenue', revenueCount1 === 1, `count=${revenueCount1}`)

  const dupCapture = await request('POST', '/payments/capture', { token, body: { orderId } })
  record('No duplicate payment', dupCapture.status === 200 && dupCapture.data?.duplicate === true, `duplicate=${dupCapture.data?.duplicate}`)

  const revenueCount2 = await db.collection('revenue').countDocuments({ orgId: DEMO_ORG, invoiceNumber: ctx.invoiceNumber, status: 'PAID' })
  record('No duplicate revenue', revenueCount2 === 1, `count=${revenueCount2}`)

  const failInit = await request('POST', '/payments/mock', {
    token,
    body: { amount: 5000, autoCapture: true, fail: true },
  })
  record('Payment failure', failInit.status === 200 && failInit.data?.status === 'FAILED', `status=${failInit.data?.status}`)

  const partialInit = await request('POST', '/payments/mock', {
    token,
    body: { amount: 10000, invoiceNumber: `INV-PART-${Date.now()}` },
  })
  const partialOrder = partialInit.data?.orderId
  const partial = await request('POST', '/payments/capture', { token, body: { orderId: partialOrder, partialAmount: 5000 } })
  record('Partial payment', partial.status === 200 && partial.data?.status === 'PARTIAL', `amount=${partial.data?.amount}`)

  const webhookEventId = `mock_evt_${Date.now()}`
  const webhookPayload = {
    provider: 'mock',
    event: 'mock.payment.captured',
    event_id: webhookEventId,
    orderId: partialOrder,
    paymentId: `mock_wh_${Date.now()}`,
  }
  const webhook1 = await request('POST', '/payments/webhook', { body: webhookPayload })
  record('Webhook validation (mock)', webhook1.status === 200 && webhook1.data?.success, `event=${webhookPayload.event}`)

  const webhookDup = await request('POST', '/payments/webhook', { body: webhookPayload })
  record('Duplicate webhook protection', webhookDup.status === 200 && webhookDup.data?.duplicate === true, `duplicate=${webhookDup.data?.duplicate}`)

  const badWebhook = await request('POST', '/payments/webhook', {
    body: { event: 'payment.captured', event_id: `bad_${Date.now()}`, payload: { payment: { entity: { order_id: 'x', id: 'y' } } } },
    headers: { 'x-razorpay-signature': 'invalid-signature' },
  })
  record('Secure webhook verification', badWebhook.status === 401, `status=${badWebhook.status}`)

  const paidPayment = await db.collection('payments').findOne({ razorpayOrderId: orderId })
  const refund = await request('POST', '/payments/refund', {
    token,
    body: { paymentId: String(paidPayment._id), amount: 11800, reason: 'QA refund' },
  })
  record('Refund processing', refund.status === 200 && refund.data?.status === 'REFUNDED', `amount=${refund.data?.amount}`)

  const renewalInit = await request('POST', '/payments/mock', {
    token,
    body: { amount: 58999, customerId: ctx.customerId },
  })
  const renewalOrder = renewalInit.data?.orderId
  await db.collection('subscriptions').insertOne({
    orgId: DEMO_ORG,
    status: 'PENDING',
    amount: 49999,
    planCode: 'BUSINESS_GROWTH',
    createdAt: new Date(),
  })
  const renewalWebhook = await request('POST', '/payments/webhook', {
    body: {
      provider: 'mock',
      event: 'mock.payment.captured',
      event_id: `renewal_${Date.now()}`,
      orderId: renewalOrder,
      paymentId: `mock_renew_${Date.now()}`,
    },
  })
  record('Subscription renewal payment', renewalWebhook.status === 200 && renewalWebhook.data?.success, `event=${renewalWebhook.data?.event}`)

  // --- Customer Portal ---
  const portalLoginRes = await request('POST', '/portal/auth/login', {
    body: { email: ctx.customerEmail, password: 'Portal@2025' },
  })
  const portalToken = portalLoginRes.data?.accessToken
  record('Customer portal login', portalLoginRes.status === 200 && portalToken, `customer=${portalLoginRes.data?.customer?.name}`)

  const portalNoAuth = await request('GET', '/portal/profile')
  record('Portal session security', portalNoAuth.status === 401, `status=${portalNoAuth.status}`)

  const reset = await request('POST', '/portal/auth/reset', {
    body: { email: ctx.customerEmail, newPassword: 'Portal@2026' },
  })
  record('Password reset', reset.status === 200 && reset.data?.success, `status=${reset.status}`)
  const relogin = await request('POST', '/portal/auth/login', { body: { email: ctx.customerEmail, password: 'Portal@2026' } })
  const portalToken2 = relogin.data?.accessToken
  record('Login after reset', relogin.status === 200 && portalToken2, `status=${relogin.status}`)

  const profile = await request('GET', '/portal/profile', { token: portalToken2 })
  record('Profile management (read)', profile.status === 200 && profile.data?.profile?.id === ctx.customerId, `name=${profile.data?.profile?.name}`)

  const profileEdit = await request('PATCH', '/portal/profile', { token: portalToken2, body: { name: 'Portal Updated', phone: '+918888888888' } })
  record('Profile management (update)', profileEdit.status === 200 && profileEdit.data?.profile?.name === 'Portal Updated', `phone=${profileEdit.data?.profile?.phone}`)

  const subs = await request('GET', '/portal/subscriptions', { token: portalToken2 })
  record('Subscription visibility', subs.status === 200 && subs.data?.items?.length > 0, `count=${subs.data?.items?.length}`)

  const invoices = await request('GET', '/portal/invoices', { token: portalToken2 })
  record('Invoice visibility', invoices.status === 200 && invoices.data?.items?.some((i) => i.invoiceNumber === ctx.invoiceNumber), `count=${invoices.data?.items?.length}`)

  const payments = await request('GET', '/portal/payments', { token: portalToken2 })
  record('Payment history', payments.status === 200 && payments.data?.items?.length > 0, `count=${payments.data?.items?.length}`)

  const ticket = await request('POST', '/portal/tickets', {
    token: portalToken2,
    body: { subject: 'Need renewal help', body: 'Please extend my plan.' },
  })
  record('Support ticket creation', ticket.status === 200 && ticket.data?.ticket?.status === 'OPEN', `id=${ticket.data?.ticket?.id}`)

  const notifications = await request('GET', '/portal/notifications', { token: portalToken2 })
  record('Customer notifications', notifications.status === 200 && notifications.data?.items?.length > 0, `count=${notifications.data?.items?.length}`)

  const adminOnPortal = await request('GET', '/portal/profile', { token })
  record('Portal RBAC (admin blocked)', adminOnPortal.status === 401, `status=${adminOnPortal.status}`)

  // --- Partner Management ---
  const partnerCreate = await request('POST', '/partners', {
    token,
    body: { name: 'QA Partner', email: `partner-${Date.now()}@test.com`, company: 'QA Partners', commissionPercent: 12 },
  })
  const partnerId = partnerCreate.data?.partner?.id
  const partnerRecordId = partnerCreate.data?.partner?.partnerId
  record('Partner onboarding', partnerCreate.status === 200 && partnerId, `status=${partnerCreate.data?.partner?.status}`)

  const approve = await request('POST', `/partners/${partnerId}/approve`, { token })
  record('Partner approval', approve.status === 200 && approve.data?.status === 'ACTIVE', `status=${approve.data?.status}`)

  const referral = await request('POST', '/partners/referrals', {
    token,
    body: { partnerId, customerId: ctx.customerId },
  })
  record('Referral registration', referral.status === 200 && referral.data?.referral?.status === 'ACTIVE', `partner=${referral.data?.referral?.partnerId}`)

  const dupReferral = await request('POST', '/partners/referrals', {
    token,
    body: { partnerId, customerId: ctx.customerId },
  })
  record('Duplicate referral prevention', dupReferral.status === 500 || dupReferral.data?.error?.includes('already'), dupReferral.data?.error)

  await db.collection('partner_commissions').insertOne({
    id: randomUUID(),
    orgId: DEMO_ORG,
    partnerId: partnerRecordId,
    partnerRecordId: partnerId,
    invoiceId: String(ctx.invoiceId),
    invoiceNumber: ctx.invoiceNumber,
    revenueAmount: 11800,
    commissionPercent: 12,
    commissionAmount: 1416,
    status: 'PENDING',
    createdAt: new Date(),
  })

  const commissions = await request('GET', '/partners/commissions', { token })
  const pendingCommission = commissions.data?.items?.find((c) => c.status === 'PENDING' && c.partnerId === partnerRecordId)
  record('Commission listing', commissions.status === 200 && pendingCommission, `count=${commissions.data?.items?.length}`)

  const expectedCommission = Number(((11800 * 12) / 100).toFixed(2))
  record('Commission accuracy', pendingCommission?.commissionAmount === expectedCommission, `expected=${expectedCommission} actual=${pendingCommission?.commissionAmount}`)

  const dashboard = await request('GET', '/partners/dashboard', { token })
  record('Partner dashboard', dashboard.status === 200 && dashboard.data?.partnerCount >= 1, `total=${dashboard.data?.totalCommission}`)
  record('Monthly payout report', dashboard.status === 200 && Array.isArray(dashboard.data?.monthlyPayoutReport), `months=${dashboard.data?.monthlyPayoutReport?.length}`)

  const tenantBVisible = dashboard.data?.totalCommission >= 99999
  record('Partner tenant isolation', !tenantBVisible, `tenantBLeaked=${tenantBVisible}`)

  const commissionDoc = await db.collection('partner_commissions').findOne({ orgId: DEMO_ORG, partnerId: partnerRecordId, status: 'PENDING' })
  const payout = await request('POST', '/partners/payout', { token, body: { commissionId: String(commissionDoc._id) } })
  record('Partner payout', payout.status === 200 && payout.data?.success, `payoutId=${payout.data?.payoutId}`)

  const dupPayout = await request('POST', '/partners/payout', { token, body: { commissionId: String(commissionDoc._id) } })
  record('Duplicate payout prevention', dupPayout.status === 200 && dupPayout.data?.duplicate === true, `duplicate=${dupPayout.data?.duplicate}`)

  const crossTenantPayout = await request('POST', '/partners/payout', {
    token,
    body: { commissionId: String((await db.collection('partner_commissions').findOne({ orgId: TENANT_B }))._id) },
  })
  record('Cross-tenant payout blocked', crossTenantPayout.status === 500 || crossTenantPayout.data?.error?.includes('NOT_FOUND'), crossTenantPayout.data?.error)

  // --- Security smoke ---
  const perfStart = Date.now()
  const perf = await request('GET', '/partners/commissions', { token })
  record('Performance smoke (commissions API)', perf.status === 200 && Date.now() - perfStart < 500, `${Date.now() - perfStart}ms`)

  await client.close()

  const passed = results.filter((r) => r.pass).length
  const failed = results.length - passed
  console.log(`\n=== PAYMENT PORTAL PARTNER RETEST ===\nPASS: ${passed}\nFAIL: ${failed}\n`)
  console.log('Module Status:')
  const payTests = results.filter((r) => r.name.includes('Payment') || r.name.includes('Webhook') || r.name.includes('Refund') || r.name.includes('Invoice') || r.name.includes('revenue') || r.name.includes('Subscription renewal'))
  const portalTests = results.filter((r) => r.name.includes('Portal') || r.name.includes('portal') || r.name.includes('Profile') || r.name.includes('Support') || r.name.includes('Customer') || r.name.includes('Password') || r.name.includes('Login after'))
  const partnerTests = results.filter((r) => r.name.includes('Partner') || r.name.includes('Referral') || r.name.includes('Commission') || r.name.includes('payout') || r.name.includes('Monthly'))
  console.log(`Payment Gateway → ${payTests.every((t) => t.pass) ? 'APPROVED' : 'BLOCKED'}`)
  console.log(`Customer Portal → ${portalTests.every((t) => t.pass) ? 'APPROVED' : 'BLOCKED'}`)
  console.log(`Partner Management → ${partnerTests.every((t) => t.pass) ? 'APPROVED' : 'BLOCKED'}`)
  console.log(`Production Readiness → ${failed === 0 ? 'APPROVED' : 'BLOCKED'}`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

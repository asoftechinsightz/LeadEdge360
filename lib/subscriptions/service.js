import { randomUUID } from 'crypto'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongo'
import { DEMO_ORG_ID } from '@/lib/tenant'
import { recognizeInvoicePayment } from '@/lib/revenue/service'
import { resolvePlanCode } from '@/lib/billing/plan-map'

export const PLAN_CATALOG = {
  STARTER: { code: 'STARTER', name: 'Starter', amount: 1499, billingCycle: 'monthly' },
  BUSINESS_GROWTH: { code: 'BUSINESS_GROWTH', name: 'Growth', amount: 4999, billingCycle: 'monthly' },
  GROWTH: { code: 'BUSINESS_GROWTH', name: 'Growth', amount: 4999, billingCycle: 'monthly' },
  ENTERPRISE: { code: 'ENTERPRISE', name: 'Enterprise', amount: 14999, billingCycle: 'monthly' },
}

const CYCLE_DAYS = { monthly: 30, quarterly: 90, annual: 365 }

function normalizePlan(code) {
  return resolvePlanCode(code)
}

function planAmount(code, billingCycle = 'monthly') {
  const plan = PLAN_CATALOG[code] || PLAN_CATALOG.STARTER
  const mult = billingCycle === 'quarterly' ? 3 : billingCycle === 'annual' ? 12 : 1
  return plan.amount * mult
}

function nextRenewalDate(billingCycle = 'monthly', from = new Date()) {
  const d = new Date(from)
  if (billingCycle === 'quarterly') d.setMonth(d.getMonth() + 3)
  else if (billingCycle === 'annual') d.setFullYear(d.getFullYear() + 1)
  else d.setMonth(d.getMonth() + 1)
  return d.toISOString()
}

export async function logSubscriptionActivity(orgId, subscriptionId, type, title, detail = '') {
  const db = await getDb()
  await db.collection('subscription_activities').insertOne({
    id: randomUUID(),
    orgId,
    subscriptionId,
    type,
    title,
    detail,
    createdAt: new Date().toISOString(),
  })
}

export async function createSubscription(orgId, payload = {}) {
  const db = await getDb()
  const planCode = normalizePlan(payload.planCode || 'STARTER')
  const billingCycle = payload.billingCycle || 'monthly'
  const amount = payload.amount ?? planAmount(planCode, billingCycle)

  if (payload.customerId) {
    const customer = await db.collection('customers').findOne({ orgId, id: payload.customerId })
    if (!customer) throw new Error('Customer not found')
  }

  const existing = payload.customerId
    ? await db.collection('customer_subscriptions').findOne({
        orgId, customerId: payload.customerId, planCode, status: { $in: ['ACTIVE', 'TRIAL', 'PENDING'] },
      })
    : null
  if (existing) throw new Error('Duplicate active subscription for customer and plan')

  const sub = {
    id: randomUUID(),
    orgId,
    customerId: payload.customerId || null,
    planCode,
    billingCycle,
    amount,
    status: payload.trial ? 'TRIAL' : 'PENDING',
    trialEndsAt: payload.trial ? nextRenewalDate('monthly', new Date(Date.now() + 14 * 86400000)) : null,
    renewalDate: null,
    startDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.collection('customer_subscriptions').insertOne(sub)
  await logSubscriptionActivity(orgId, sub.id, 'created', 'Subscription created', planCode)

  if (payload.customerId) {
    const { logCustomerActivity } = await import('@/lib/customers/service')
    await logCustomerActivity(orgId, payload.customerId, 'subscription', 'Subscription created', planCode)
  }

  return { success: true, subscription: sub }
}

export async function listSubscriptions(orgId, { page = 1, limit = 20, status = null, customerId = null } = {}) {
  const db = await getDb()
  const filter = { orgId }
  if (status) filter.status = status
  if (customerId) filter.customerId = customerId
  page = Math.max(parseInt(page, 10) || 1, 1)
  limit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100)

  const [items, total] = await Promise.all([
    db.collection('customer_subscriptions').find(filter, { projection: { _id: 0 } })
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    db.collection('customer_subscriptions').countDocuments(filter),
  ])

  return { success: true, page, limit, total, pages: Math.ceil(total / limit), items }
}

export async function getSubscription(orgId, subscriptionId) {
  const db = await getDb()
  const subscription = await db.collection('customer_subscriptions')
    .findOne({ orgId, id: subscriptionId }, { projection: { _id: 0 } })
  if (!subscription) return null

  const activities = await db.collection('subscription_activities')
    .find({ orgId, subscriptionId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 }).limit(50).toArray()

  return { ...subscription, activities }
}

async function getSub(orgId, subscriptionId) {
  const db = await getDb()
  const sub = await db.collection('customer_subscriptions').findOne({ orgId, id: subscriptionId })
  if (!sub) throw new Error('Subscription not found')
  return sub
}

export async function activateSubscription(orgId, subscriptionId) {
  const db = await getDb()
  const sub = await getSub(orgId, subscriptionId)
  if (!['PENDING', 'TRIAL', 'SUSPENDED'].includes(sub.status)) {
    throw new Error(`Cannot activate from status ${sub.status}`)
  }

  const now = new Date().toISOString()
  const renewalDate = nextRenewalDate(sub.billingCycle)
  await db.collection('customer_subscriptions').updateOne(
    { orgId, id: subscriptionId },
    { $set: { status: 'ACTIVE', startDate: now, renewalDate, updatedAt: now, activatedAt: now } }
  )
  await logSubscriptionActivity(orgId, subscriptionId, 'activated', 'Subscription activated')
  return { success: true, status: 'ACTIVE', renewalDate }
}

export async function suspendSubscription(orgId, subscriptionId, reason = '') {
  const db = await getDb()
  await getSub(orgId, subscriptionId)
  await db.collection('customer_subscriptions').updateOne(
    { orgId, id: subscriptionId },
    { $set: { status: 'SUSPENDED', suspendedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } }
  )
  await logSubscriptionActivity(orgId, subscriptionId, 'suspended', 'Subscription suspended', reason)
  return { success: true, status: 'SUSPENDED' }
}

export async function resumeSubscription(orgId, subscriptionId) {
  return activateSubscription(orgId, subscriptionId)
}

export async function cancelSubscription(orgId, subscriptionId, reason = '') {
  const db = await getDb()
  await getSub(orgId, subscriptionId)
  await db.collection('customer_subscriptions').updateOne(
    { orgId, id: subscriptionId },
    { $set: { status: 'CANCELLED', cancelledAt: new Date().toISOString(), updatedAt: new Date().toISOString() } }
  )
  await logSubscriptionActivity(orgId, subscriptionId, 'cancelled', 'Subscription cancelled', reason)
  return { success: true, status: 'CANCELLED' }
}

export async function renewSubscription(orgId, subscriptionId, { manual = false } = {}) {
  const db = await getDb()
  const sub = await getSub(orgId, subscriptionId)
  if (!['ACTIVE', 'GRACE_PERIOD', 'PAST_DUE'].includes(sub.status) && !manual) {
    throw new Error(`Cannot renew from status ${sub.status}`)
  }

  const invoiceNumber = `INV-SUB-${Date.now()}`
  const gstAmount = Math.round(sub.amount * 0.18)
  const totalAmount = sub.amount + gstAmount
  const invoice = {
    invoiceNumber,
    orgId,
    customerId: sub.customerId,
    clientName: sub.customerId || 'Subscription',
    company: sub.customerId || '',
    product: sub.planCode,
    source: 'subscription_renewal',
    subtotal: sub.amount,
    gstPercent: 18,
    gstAmount,
    totalAmount,
    status: 'UNPAID',
    subscriptionId: sub.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const ins = await db.collection('invoices').insertOne(invoice)
  const renewalDate = nextRenewalDate(sub.billingCycle)

  await db.collection('customer_subscriptions').updateOne(
    { orgId, id: subscriptionId },
    { $set: { renewalDate, lastRenewalAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'ACTIVE' } }
  )
  await logSubscriptionActivity(orgId, subscriptionId, 'renewal', manual ? 'Manual renewal' : 'Auto renewal', invoiceNumber)

  return {
    success: true,
    invoiceId: ins.insertedId,
    invoiceNumber,
    totalAmount,
    renewalDate,
    autoRenew: !manual,
  }
}

export async function changeSubscriptionPlan(orgId, subscriptionId, newPlanCode) {
  const db = await getDb()
  const sub = await getSub(orgId, subscriptionId)
  const oldPlan = normalizePlan(sub.planCode)
  const newPlan = normalizePlan(newPlanCode)
  if (oldPlan === newPlan) return { success: true, subscription: sub, proration: 0 }

  const cycleDays = CYCLE_DAYS[sub.billingCycle] || 30
  const renewal = sub.renewalDate ? new Date(sub.renewalDate) : new Date(Date.now() + cycleDays * 86400000)
  const daysRemaining = Math.max(0, Math.ceil((renewal - Date.now()) / 86400000))
  const oldDaily = planAmount(oldPlan, sub.billingCycle) / cycleDays
  const newDaily = planAmount(newPlan, sub.billingCycle) / cycleDays
  const proration = Math.round((newDaily - oldDaily) * daysRemaining)
  const newAmount = planAmount(newPlan, sub.billingCycle)

  await db.collection('customer_subscriptions').updateOne(
    { orgId, id: subscriptionId },
    { $set: { planCode: newPlan, amount: newAmount, updatedAt: new Date().toISOString() } }
  )
  await logSubscriptionActivity(orgId, subscriptionId, 'plan_change', `${oldPlan} → ${newPlan}`, `proration=${proration}`)

  const updated = await db.collection('customer_subscriptions').findOne({ orgId, id: subscriptionId }, { projection: { _id: 0 } })
  return { success: true, subscription: updated, proration, oldPlan, newPlan }
}

export async function createTrial(orgId, payload) {
  return createSubscription(orgId, { ...payload, trial: true, planCode: payload.planCode || 'BUSINESS_GROWTH' })
}

export async function convertTrial(orgId, subscriptionId) {
  const db = await getDb()
  const sub = await getSub(orgId, subscriptionId)
  if (sub.status !== 'TRIAL') throw new Error('Subscription is not in trial')
  return activateSubscription(orgId, subscriptionId)
}

export async function expireTrial(orgId, subscriptionId) {
  const db = await getDb()
  const sub = await getSub(orgId, subscriptionId)
  if (sub.status !== 'TRIAL') throw new Error('Subscription is not in trial')
  await db.collection('customer_subscriptions').updateOne(
    { orgId, id: subscriptionId },
    { $set: { status: 'CANCELLED', updatedAt: new Date().toISOString() } }
  )
  await logSubscriptionActivity(orgId, subscriptionId, 'trial_expired', 'Trial expired')
  return { success: true, status: 'CANCELLED' }
}

export async function processFailedPayment(orgId, subscriptionId) {
  const db = await getDb()
  const sub = await getSub(orgId, subscriptionId)
  let nextStatus = 'PAST_DUE'
  if (sub.status === 'PAST_DUE') nextStatus = 'GRACE_PERIOD'
  else if (sub.status === 'GRACE_PERIOD') nextStatus = 'SUSPENDED'

  await db.collection('customer_subscriptions').updateOne(
    { orgId, id: subscriptionId },
    { $set: { status: nextStatus, dunningStep: nextStatus, updatedAt: new Date().toISOString() } }
  )
  await logSubscriptionActivity(orgId, subscriptionId, 'dunning', `Payment failed → ${nextStatus}`)
  return { success: true, status: nextStatus, reminderSent: true }
}

export async function reactivateAfterPayment(orgId, subscriptionId, invoiceId) {
  const db = await getDb()
  const oid = typeof invoiceId === 'string' ? new ObjectId(invoiceId) : invoiceId
  const invoice = await db.collection('invoices').findOne({ _id: oid, orgId })
  if (!invoice) throw new Error('Invoice not found')
  await recognizeInvoicePayment(orgId, invoice)
  await db.collection('customer_subscriptions').updateOne(
    { orgId, id: subscriptionId },
    { $set: { status: 'ACTIVE', dunningStep: null, updatedAt: new Date().toISOString() } }
  )
  await logSubscriptionActivity(orgId, subscriptionId, 'reactivated', 'Payment received — reactivated')
  return { success: true, status: 'ACTIVE' }
}

export async function getSubscriptionMetrics(orgId) {
  const db = await getDb()
  const active = await db.collection('customer_subscriptions')
    .find({ orgId, status: { $in: ['ACTIVE', 'TRIAL'] } }).toArray()

  let mrr = 0
  for (const sub of active) {
    const amt = Number(sub.amount || 0)
    if (sub.billingCycle === 'annual') mrr += amt / 12
    else if (sub.billingCycle === 'quarterly') mrr += amt / 3
    else mrr += amt
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
  const cancelled = await db.collection('customer_subscriptions').countDocuments({
    orgId, status: 'CANCELLED', cancelledAt: { $gte: thirtyDaysAgo },
  })
  const activeCount = active.length || 1
  const churnRate = Number(((cancelled / activeCount) * 100).toFixed(2))

  const paidRevenue = await db.collection('revenue').aggregate([
    { $match: { orgId, status: 'PAID' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]).toArray()
  const totalRev = paidRevenue[0]?.total || 0
  const customers = await db.collection('customers').countDocuments({ orgId }) || 1

  return {
    success: true,
    mrr: Math.round(mrr),
    arr: Math.round(mrr * 12),
    churnRate,
    customerLifetimeValue: Math.round(totalRev / customers),
    netRevenueRetention: 100,
    expansionRevenue: 0,
    contractionRevenue: 0,
    activeSubscriptions: active.length,
  }
}

export async function exportSubscriptionsCsv(orgId) {
  const db = await getDb()
  const rows = await db.collection('customer_subscriptions').find({ orgId }, { projection: { _id: 0 } }).toArray()
  const header = 'id,customerId,planCode,status,amount,billingCycle,renewalDate'
  const lines = rows.map((r) => [r.id, r.customerId, r.planCode, r.status, r.amount, r.billingCycle, r.renewalDate].join(','))
  return { success: true, csv: [header, ...lines].join('\n'), rowCount: rows.length }
}

export async function seedDemoSubscriptionsIfEmpty(db) {
  const count = await db.collection('customer_subscriptions').countDocuments({ orgId: DEMO_ORG_ID })
  if (count > 0) return

  const customer = await db.collection('customers').findOne({ orgId: DEMO_ORG_ID, parentCustomerId: null })
  if (!customer) return

  const subId = randomUUID()
  await db.collection('customer_subscriptions').insertOne({
    id: subId,
    orgId: DEMO_ORG_ID,
    customerId: customer.id,
    planCode: 'BUSINESS_GROWTH',
    billingCycle: 'monthly',
    amount: 4999,
    status: 'ACTIVE',
    startDate: new Date().toISOString(),
    renewalDate: nextRenewalDate('monthly'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activatedAt: new Date().toISOString(),
  })
  await logSubscriptionActivity(DEMO_ORG_ID, subId, 'created', 'Demo subscription seeded')
}

export async function seedSubscriptionPlansIfEmpty(db) {
  const count = await db.collection('subscription_plans').countDocuments({})
  if (count > 0) return
  await db.collection('subscription_plans').insertMany([
    { code: 'STARTER', name: 'Starter', amount: 1499, billingCycle: 'monthly' },
    { code: 'BUSINESS_GROWTH', name: 'Growth', amount: 4999, billingCycle: 'monthly' },
    { code: 'ENTERPRISE', name: 'Enterprise', amount: 14999, billingCycle: 'monthly' },
  ])
}

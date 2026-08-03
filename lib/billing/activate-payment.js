import { v4 as uuid } from 'uuid'
import { getEntitlementsForPlan, getOrgBillingPatch } from './plan-entitlements.js'
import { writeAuditLog } from './audit.js'

const ACTIVE_STATUSES = ['trialing', 'active']

function addDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

/**
 * Idempotent post-payment activation: payment → subscription → org → user → audit.
 */
export async function activatePaymentSuccess(db, {
  razorpay_order_id,
  razorpay_payment_id,
  source,
  actorUserId,
  request,
}) {
  const paymentsCol = db.collection('payments')
  const payment = await paymentsCol.findOne({ razorpay_order_id })
  if (!payment) {
    throw new Error(`Payment not found for order ${razorpay_order_id}`)
  }

  if (payment.status === 'paid' && payment.subscriptionId) {
    const subscription = await db.collection('subscriptions').findOne(
      { id: payment.subscriptionId },
      { projection: { _id: 0 } },
    )
    const org = await db.collection('orgs').findOne(
      { id: payment.orgId },
      { projection: { _id: 0 } },
    )
    const entitlements = getEntitlementsForPlan(org?.plan || payment.plan)
    return { alreadyActivated: true, payment, subscription, org, entitlements }
  }

  const planId = payment.plan
  const orgId = payment.orgId
  const now = new Date().toISOString()
  const entitlements = getEntitlementsForPlan(planId)
  const purchaserId = actorUserId || payment.userId || null

  await db.collection('subscriptions').updateMany(
    { orgId, status: { $in: ACTIVE_STATUSES } },
    { $set: { status: 'cancelled', cancelledAt: now, updatedAt: now } },
  )

  const previousOrg = await db.collection('orgs').findOne(
    { id: orgId },
    { projection: { plan: 1 } },
  )
  const subscriptionId = uuid()

  const subscription = {
    id: subscriptionId,
    orgId,
    productCode: 'platform',
    planCode: planId,
    status: 'active',
    currentStart: now,
    currentEnd: addDays(30),
    razorpay_order_id,
    razorpay_payment_id,
    paymentId: payment.id,
    limits: entitlements.limits,
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('subscriptions').insertOne(subscription)

  await paymentsCol.updateOne(
    { razorpay_order_id },
    {
      $set: {
        status: 'paid',
        razorpay_payment_id,
        paidAt: now,
        activatedAt: now,
        activationSource: source,
        subscriptionId,
      },
    },
  )

  await db.collection('orgs').updateOne(
    { id: orgId },
    { $set: { ...getOrgBillingPatch(planId), activeSubscriptionId: subscriptionId } },
  )

  if (purchaserId) {
    await db.collection('users').updateOne(
      { id: purchaserId },
      { $set: { lastSubscriptionId: subscriptionId, lastPaymentAt: now } },
    )
  }

  await writeAuditLog(db, {
    orgId,
    userId: purchaserId,
    action: 'subscription.activated',
    entity: 'subscription',
    entityId: subscriptionId,
    diff: {
      planCode: planId,
      previousPlan: previousOrg?.plan || null,
      paymentId: payment.id,
      razorpay_order_id,
      source,
    },
    request,
  })

  const updatedPayment = await paymentsCol.findOne(
    { razorpay_order_id },
    { projection: { _id: 0 } },
  )
  const org = await db.collection('orgs').findOne(
    { id: orgId },
    { projection: { _id: 0 } },
  )

  return {
    alreadyActivated: false,
    payment: updatedPayment,
    subscription,
    org,
    entitlements,
  }
}

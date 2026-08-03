/**
 * CLI smoke test for Sprint 19A billing activation + E-004 plan entitlements.
 *
 * Usage:
 *   MONGO_URL=mongodb://localhost:27017 DB_NAME=asoftech_saas node scripts/simulate-billing-flow.mjs
 *
 * Entitlement enforcement tests set ENFORCE_PLAN_LIMITS=true internally.
 */

import { MongoClient } from 'mongodb'
import { v4 as uuid } from 'uuid'
import { activatePaymentSuccess } from '../lib/billing/activate-payment.js'
import {
  checkEntitlement,
  isPlanEnforcementEnabled,
  getLeadsMonthBoundsIso,
} from '../lib/billing/plan-entitlements.js'

async function runBillingActivationTest(db) {
  const orgId = uuid()
  const userId = uuid()
  const orderId = `order_test_${uuid()}`
  const paymentId = uuid()
  const now = new Date().toISOString()

  await db.collection('orgs').insertOne({
    id: orgId,
    name: 'Billing Test Org',
    ownerEmail: 'billing-test@example.com',
    plan: 'starter',
    createdAt: now,
  })
  await db.collection('users').insertOne({
    id: userId,
    email: 'billing-test@example.com',
    name: 'Billing Test',
    orgId,
    role: 'admin',
    createdAt: now,
  })
  await db.collection('payments').insertOne({
    id: paymentId,
    orgId,
    userId,
    razorpay_order_id: orderId,
    amount: 1499,
    plan: 'starter',
    status: 'created',
    createdAt: now,
    testMode: true,
  })

  const result = await activatePaymentSuccess(db, {
    razorpay_order_id: orderId,
    razorpay_payment_id: `pay_test_${uuid()}`,
    source: 'verify',
    actorUserId: userId,
  })

  const user = await db.collection('users').findOne({ id: userId })
  const auditCount = await db.collection('audit_logs').countDocuments({
    orgId,
    action: 'subscription.activated',
  })

  const checks = [
    ['payment paid', result.payment?.status === 'paid'],
    ['subscription active', result.subscription?.status === 'active'],
    ['org plan starter', result.org?.plan === 'starter'],
    ['lead enabled', result.org?.leadEnabled === true],
    ['retail disabled', result.org?.retailEnabled === false],
    ['user lastSubscriptionId', user?.lastSubscriptionId === result.subscription?.id],
    ['audit log', auditCount === 1],
  ]

  let failed = false
  for (const [label, ok] of checks) {
    console.log(ok ? '✓' : '✗', label)
    if (!ok) failed = true
  }

  return { failed, orgId }
}

async function runEntitlementTests(db) {
  const prevEnforce = process.env.ENFORCE_PLAN_LIMITS
  const prevGrandfather = process.env.GRANDFATHER_ORG_IDS
  process.env.ENFORCE_PLAN_LIMITS = 'true'
  process.env.GRANDFATHER_ORG_IDS = ''

  let failed = false
  const assert = (label, ok) => {
    console.log(ok ? '✓' : '✗', label)
    if (!ok) failed = true
  }

  console.log('\n--- E-004 entitlement tests (ENFORCE_PLAN_LIMITS=true) ---')

  assert('enforcement flag on', isPlanEnforcementEnabled() === true)

  // Demo org exempt
  const demoGate = await checkEntitlement(db, 'demo-org', 'lead.create')
  assert('demo org exempt lead.create', demoGate.allowed === true)

  // Enforcement off
  process.env.ENFORCE_PLAN_LIMITS = 'false'
  const starterOffOrg = uuid()
  await db.collection('orgs').insertOne({
    id: starterOffOrg,
    name: 'Off Org',
    plan: 'starter',
    leadEnabled: true,
    retailEnabled: false,
    createdAt: new Date().toISOString(),
  })
  const offGate = await checkEntitlement(db, starterOffOrg, 'lead.create')
  assert('enforcement off allows lead', offGate.allowed === true)
  process.env.ENFORCE_PLAN_LIMITS = 'true'

  // Starter retail blocked
  const starterOrg = uuid()
  await db.collection('orgs').insertOne({
    id: starterOrg,
    name: 'Starter Org',
    plan: 'starter',
    leadEnabled: true,
    retailEnabled: false,
    createdAt: new Date().toISOString(),
  })
  const retailGate = await checkEntitlement(db, starterOrg, 'retail.create')
  assert('starter retail 403', retailGate.allowed === false && retailGate.status === 403)
  assert('starter retail code', retailGate.body?.code === 'PLAN_RETAIL_DISABLED')

  // Lead cap at 500
  const { start, end } = getLeadsMonthBoundsIso()
  const capOrg = uuid()
  await db.collection('orgs').insertOne({
    id: capOrg,
    name: 'Cap Org',
    plan: 'starter',
    leadEnabled: true,
    retailEnabled: false,
    createdAt: new Date().toISOString(),
  })
  const leadDocs = Array.from({ length: 500 }, (_, i) => ({
    id: uuid(),
    orgId: capOrg,
    name: `Lead ${i}`,
    phone: `+9199${String(i).padStart(8, '0')}`,
    createdAt: new Date(start).toISOString(),
    status: 'New',
  }))
  await db.collection('leads').insertMany(leadDocs)
  const leadGate = await checkEntitlement(db, capOrg, 'lead.create')
  assert('starter lead cap 402', leadGate.allowed === false && leadGate.status === 402)
  assert('starter lead code', leadGate.body?.code === 'PLAN_LIMIT_LEADS')
  assert('starter lead limit 500', leadGate.body?.limit === 500)

  // Growth user cap at 5
  const growthOrg = uuid()
  await db.collection('orgs').insertOne({
    id: growthOrg,
    name: 'Growth Org',
    plan: 'growth',
    leadEnabled: true,
    retailEnabled: true,
    createdAt: new Date().toISOString(),
  })
  const users = Array.from({ length: 5 }, (_, i) => ({
    id: uuid(),
    orgId: growthOrg,
    email: `growth${i}@test.example`,
    role: 'agent',
    status: 'active',
    createdAt: new Date().toISOString(),
  }))
  await db.collection('users').insertMany(users)
  const userGate = await checkEntitlement(db, growthOrg, 'user.create')
  assert('growth user cap 402', userGate.allowed === false && userGate.status === 402)
  assert('growth user code', userGate.body?.code === 'PLAN_LIMIT_USERS')

  // Scale unlimited
  const scaleOrg = uuid()
  await db.collection('orgs').insertOne({
    id: scaleOrg,
    name: 'Scale Org',
    plan: 'scale',
    leadEnabled: true,
    retailEnabled: true,
    createdAt: new Date().toISOString(),
  })
  const scaleGate = await checkEntitlement(db, scaleOrg, 'lead.create')
  assert('scale unlimited leads', scaleGate.allowed === true)

  // Grandfather
  const gfOrg = uuid()
  process.env.GRANDFATHER_ORG_IDS = gfOrg
  await db.collection('orgs').insertOne({
    id: gfOrg,
    name: 'GF Org',
    plan: 'starter',
    leadEnabled: true,
    retailEnabled: false,
    createdAt: new Date().toISOString(),
  })
  await db.collection('leads').insertMany(
    Array.from({ length: 501 }, (_, i) => ({
      id: uuid(),
      orgId: gfOrg,
      name: `GF ${i}`,
      phone: `+9188${String(i).padStart(8, '0')}`,
      createdAt: start,
      status: 'New',
    })),
  )
  const gfGate = await checkEntitlement(db, gfOrg, 'lead.create')
  assert('grandfather exempt over cap', gfGate.allowed === true)

  // Unknown plan → starter (missing plan field)
  const unknownOrg = uuid()
  await db.collection('orgs').insertOne({
    id: unknownOrg,
    name: 'Unknown Plan Org',
    createdAt: new Date().toISOString(),
  })
  const unkRetail = await checkEntitlement(db, unknownOrg, 'retail.create')
  assert('unknown plan as starter retail blocked', unkRetail.allowed === false)

  process.env.ENFORCE_PLAN_LIMITS = prevEnforce ?? 'false'
  process.env.GRANDFATHER_ORG_IDS = prevGrandfather ?? ''

  return { failed }
}

async function main() {
  const uri = process.env.MONGO_URL
  const dbName = process.env.DB_NAME || 'asoftech_saas'
  if (!uri) {
    console.error('Set MONGO_URL')
    process.exit(1)
  }

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)

  console.log('--- Billing activation (Sprint 19A) ---')
  const billing = await runBillingActivationTest(db)

  const ent = await runEntitlementTests(db)

  await client.close()

  if (billing.failed || ent.failed) {
    console.error('\nBilling / entitlement smoke test FAILED')
    process.exit(1)
  }
  console.log('\nBilling + entitlement smoke tests PASSED')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

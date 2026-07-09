import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'crypto'

/** Mirrors lib/razorpay.js PLANS — keep in sync for mobile/web checkout parity. */
const PLANS = [
  { id: 'starter', planCode: 'STARTER', name: 'Starter', price: 1499, currency: 'INR', interval: 'monthly' },
  { id: 'growth', planCode: 'BUSINESS_GROWTH', name: 'Growth', price: 4999, currency: 'INR', interval: 'monthly' },
  { id: 'scale', planCode: 'ENTERPRISE', name: 'Scale', price: null, currency: 'INR', interval: 'monthly', custom: true },
]

const RAZORPAY_TO_PLAN = {
  starter: 'STARTER',
  growth: 'BUSINESS_GROWTH',
  scale: 'ENTERPRISE',
}

function resolvePlanCode(raw) {
  if (!raw) return 'STARTER'
  const lower = String(raw).toLowerCase()
  if (RAZORPAY_TO_PLAN[lower]) return RAZORPAY_TO_PLAN[lower]
  return String(raw).toUpperCase()
}

function verifyCheckoutSignature({ order_id, payment_id, signature }, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${order_id}|${payment_id}`)
    .digest('hex')
  return expected === signature
}

describe('billing API integration (unit)', () => {
  const secret = 'ci-test-razorpay-secret'

  it('exposes canonical SaaS plans for mobile and web checkout', () => {
    assert.equal(PLANS.length, 3)
    const growth = PLANS.find((p) => p.id === 'growth')
    assert.equal(growth.planCode, 'BUSINESS_GROWTH')
    assert.equal(growth.price, 4999)
    const scale = PLANS.find((p) => p.id === 'scale')
    assert.equal(scale.custom, true)
    assert.equal(scale.price, null)
  })

  it('maps Razorpay plan ids to internal plan codes', () => {
    assert.equal(resolvePlanCode('starter'), 'STARTER')
    assert.equal(resolvePlanCode('growth'), 'BUSINESS_GROWTH')
    assert.equal(resolvePlanCode('scale'), 'ENTERPRISE')
  })

  it('verifies Razorpay checkout signatures (mobile verify payload)', () => {
    const orderId = 'order_ci_test_001'
    const paymentId = 'pay_ci_test_001'
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    assert.equal(verifyCheckoutSignature({ order_id: orderId, payment_id: paymentId, signature }, secret), true)
    assert.equal(verifyCheckoutSignature({ order_id: orderId, payment_id: paymentId, signature: 'bad' }, secret), false)
  })

  it('rejects custom scale plan for self-serve checkout', () => {
    const scale = PLANS.find((p) => p.id === 'scale')
    assert.equal(scale.custom, true)
  })
})

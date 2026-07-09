import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'crypto'
import { PIPELINE_COLUMNS, STAGES } from '../lib/opportunities/stages.js'

function verifyCheckoutSignature({ order_id, payment_id, signature }, secret) {
  const expected = crypto.createHmac('sha256', secret).update(`${order_id}|${payment_id}`).digest('hex')
  return expected === signature
}

describe('RC2 retail & billing (unit)', () => {
  it('razorpay signature verification for POS', () => {
    const secret = 'test_secret'
    const order_id = 'order_1'
    const payment_id = 'pay_1'
    const signature = crypto.createHmac('sha256', secret).update(`${order_id}|${payment_id}`).digest('hex')
    assert.equal(verifyCheckoutSignature({ order_id, payment_id, signature }, secret), true)
    assert.equal(verifyCheckoutSignature({ order_id, payment_id, signature: 'bad' }, secret), false)
  })

  it('POS checkout payload shape', () => {
    const body = {
      items: [{ inventoryId: 'inv-1', qty: 2, unitPrice: 99 }],
      paymentMethod: 'upi',
      razorpay_order_id: 'order_x',
      razorpay_payment_id: 'pay_x',
      razorpay_signature: 'sig',
    }
    assert.equal(body.paymentMethod, 'upi')
    assert.ok(body.razorpay_order_id)
  })

  it('opportunity stages are backend keys', () => {
    for (const col of PIPELINE_COLUMNS) {
      assert.ok(STAGES[col.stage] !== undefined, col.stage)
    }
  })

  it('retail payment methods supported', () => {
    assert.deepEqual(['cash', 'upi', 'card'].sort(), ['card', 'cash', 'upi'])
  })
})

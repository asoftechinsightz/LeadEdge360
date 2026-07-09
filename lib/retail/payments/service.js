import { randomUUID } from 'crypto'
import { getRazorpay, RZP_CONFIGURED, verifyCheckoutSignature } from '@/lib/razorpay'
import { getOrgBranding } from '@/lib/branding/service'
import { checkout as completeCheckout } from '@/lib/retail/sales/service'

const PENDING = 'retail_payment_orders'

export async function previewCartTotal(db, orgId, items) {
  const cartItems = Array.isArray(items) ? items : []
  if (!cartItems.length) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Cart is empty'
    throw err
  }

  let total = 0
  for (const line of cartItems) {
    const qty = Math.max(1, Number(line.qty || 1))
    const inv = await db.collection('retail_inventory').findOne({ orgId, id: line.inventoryId || line.id })
    if (!inv) {
      const err = new Error('NOT_FOUND')
      err.detail = `Inventory ${line.inventoryId || line.id} not found`
      throw err
    }
    if (Number(inv.quantity || 0) < qty) {
      const err = new Error('VALIDATION_FAILED')
      err.detail = 'Insufficient stock'
      throw err
    }
    const product = await db.collection('retail_products').findOne({ orgId, id: inv.productId })
    const unitPrice = Number(line.unitPrice ?? product?.price ?? 0)
    total += unitPrice * qty
  }

  return { total, itemCount: cartItems.length }
}

export async function createRetailPaymentOrder(db, orgId, userId, payload = {}) {
  const { total } = await previewCartTotal(db, orgId, payload.items)
  if (total <= 0) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Invalid cart total'
    throw err
  }

  const rzp = getRazorpay()
  if (!rzp) {
    const err = new Error('RAZORPAY_NOT_CONFIGURED')
    err.detail = 'Payment gateway not configured'
    throw err
  }

  const order = await rzp.orders.create({
    amount: Math.round(total * 100),
    currency: 'INR',
    receipt: `pos_${Date.now()}`,
    notes: { orgId, type: 'retail_pos' },
  })

  const now = new Date().toISOString()
  const doc = {
    id: randomUUID(),
    orgId,
    razorpay_order_id: order.id,
    amount: total,
    items: payload.items,
    paymentMethod: payload.paymentMethod || 'upi',
    status: 'created',
    createdAt: now,
    createdBy: userId,
  }
  await db.collection(PENDING).insertOne(doc)

  const branding = await getOrgBranding(db, orgId)
  const merchantName = branding.companyName || branding.legalName || 'Retail POS'

  return {
    order,
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: total,
    merchantName,
    configured: RZP_CONFIGURED,
  }
}

export async function checkoutWithPayment(db, orgId, userId, payload = {}, meta = {}) {
  const method = String(payload.paymentMethod || 'cash').toLowerCase()

  if (method === 'cash') {
    return completeCheckout(db, orgId, userId, { ...payload, paymentMethod: 'cash' }, meta)
  }

  if (method === 'upi' || method === 'card') {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const ok = verifyCheckoutSignature({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
      })
      if (!ok) {
        const err = new Error('VALIDATION_FAILED')
        err.detail = 'Invalid payment signature'
        throw err
      }
      await db.collection(PENDING).updateOne(
        { orgId, razorpay_order_id },
        { $set: { status: 'paid', paidAt: new Date().toISOString() } },
      )
    } else if (RZP_CONFIGURED) {
      const err = new Error('VALIDATION_FAILED')
      err.detail = 'Payment verification required for UPI/card'
      throw err
    }

    return completeCheckout(db, orgId, userId, {
      ...payload,
      paymentMethod: method,
      razorpayOrderId: razorpay_order_id || null,
      razorpayPaymentId: razorpay_payment_id || null,
    }, meta)
  }

  const err = new Error('VALIDATION_FAILED')
  err.detail = 'Unsupported payment method'
  throw err
}

import { randomUUID } from 'crypto'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongo'
import { verifyCheckoutSignature, verifyWebhookSignature } from '@/lib/razorpay'
import { recognizeInvoicePayment, recordRefund } from '@/lib/revenue/service'
import { recordPartnerCommission } from '@/lib/partners/service'
import { getTenantCompanyName, getTenantProductName } from '@/lib/branding/tenant-defaults'
import { writeAuditLog } from '@/lib/audit/service'
import { emitPlatformEvent } from '@/lib/events/bus'
import { emitInvoiceEvent } from '@/lib/events/emit-helpers'
import { PLATFORM_EVENTS } from '@/lib/events/types'

export async function findPaymentByOrderId(db, orderId) {
  return db.collection('payments').findOne({
    $or: [{ razorpayOrderId: orderId }, { razorpay_order_id: orderId }],
  })
}

export async function initiateMockPayment(orgId, { amount, invoiceNumber, invoiceId, customerId }) {
  const db = await getDb()
  if (amount <= 0) throw new Error('INVALID_AMOUNT')

  const orderId = `mock_order_${Date.now()}_${randomUUID().slice(0, 8)}`
  const payment = {
    orgId,
    razorpayOrderId: orderId,
    razorpay_order_id: orderId,
    amount: Number(amount),
    invoiceNumber: invoiceNumber || null,
    invoiceId: invoiceId || null,
    customerId: customerId || null,
    provider: 'mock',
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection('payments').insertOne(payment)
  return { success: true, orderId, paymentId: result.insertedId, amount, provider: 'mock' }
}

export async function captureMockPayment(orgId, orderId, { partialAmount = null, fail = false } = {}) {
  const db = await getDb()
  const payment = await findPaymentByOrderId(db, orderId)
  if (!payment || payment.orgId !== orgId) throw new Error('Payment not found')

  if (fail) {
    await db.collection('payments').updateOne(
      { _id: payment._id },
      { $set: { status: 'FAILED', failedAt: new Date(), updatedAt: new Date() } }
    )
    await emitPlatformEvent({
      db,
      orgId,
      type: PLATFORM_EVENTS.PAYMENT_FAILED,
      entity: 'payment',
      entityId: String(payment._id),
      payload: { orderId, amount: payment.amount, invoiceNumber: payment.invoiceNumber },
      source: 'payments',
    })
    return { success: true, status: 'FAILED', revenueRecognized: false }
  }

  return completePayment(db, payment, {
    paymentId: `mock_pay_${Date.now()}`,
    amount: partialAmount ?? payment.amount,
    source: 'mock_capture',
  })
}

export async function verifyCheckoutPayment(orgId, { order_id, payment_id, signature }) {
  if (!verifyCheckoutSignature({ order_id, payment_id, signature })) {
    return { success: false, verified: false }
  }
  const db = await getDb()
  const payment = await findPaymentByOrderId(db, order_id)
  if (!payment || payment.orgId !== orgId) return { success: false, error: 'Payment not found' }

  return completePayment(db, payment, { paymentId: payment_id, source: 'checkout_verify' })
}

async function completePayment(db, payment, { paymentId, amount = null, source = 'webhook' }) {
  if (payment.status === 'PAID') {
    return { success: true, duplicate: true, status: 'PAID', revenueRecognized: false }
  }

  const payAmount = amount ?? payment.amount
  const isPartial = payAmount < payment.amount
  const status = isPartial ? 'PARTIAL' : 'PAID'
  await db.collection('payments').updateOne(
    { _id: payment._id },
    {
      $set: {
        razorpayPaymentId: paymentId,
        razorpay_payment_id: paymentId,
        status,
        paidAmount: payAmount,
        paidAt: new Date(),
        updatedAt: new Date(),
        captureSource: source,
      },
    }
  )

  await writeAuditLog({
    orgId: payment.orgId,
    action: 'payment_captured',
    entity: 'payment',
    entityId: String(payment._id),
    detail: { amount: payAmount, source },
  })

  let revenueRecognized = false
  let invoiceClosed = false
  if (payment.invoiceId || payment.invoiceNumber) {
    let invoice = null
    if (payment.invoiceId && ObjectId.isValid(String(payment.invoiceId))) {
      invoice = await db.collection('invoices').findOne({ _id: new ObjectId(String(payment.invoiceId)), orgId: payment.orgId })
    }
    if (!invoice && payment.invoiceNumber) {
      invoice = await db.collection('invoices').findOne({ invoiceNumber: payment.invoiceNumber, orgId: payment.orgId })
    }
    if (invoice) {
      const result = await recognizeInvoicePayment(payment.orgId, invoice, { paymentId: String(payment._id), amount: payAmount })
      revenueRecognized = result.recognized === true
      invoiceClosed = result.closed === true || status === 'PAID'
    }
  }

  const paymentEventType = isPartial ? PLATFORM_EVENTS.PAYMENT_PARTIAL : PLATFORM_EVENTS.PAYMENT_RECEIVED
  await emitPlatformEvent({
    db,
    orgId: payment.orgId,
    type: paymentEventType,
    entity: 'payment',
    entityId: String(payment._id),
    payload: {
      amount: payAmount,
      invoiceNumber: payment.invoiceNumber,
      status,
      source,
    },
    source: 'payments',
  })

  if (status === 'PAID' && payment.invoiceNumber) {
    await emitInvoiceEvent(db, {
      orgId: payment.orgId,
      type: PLATFORM_EVENTS.INVOICE_PAID,
      invoiceId: payment.invoiceId ? String(payment.invoiceId) : payment.invoiceNumber,
      payload: { invoiceNumber: payment.invoiceNumber, amount: payAmount },
    })
  }

  if (invoiceClosed) {
    await emitInvoiceEvent(db, {
      orgId: payment.orgId,
      type: PLATFORM_EVENTS.INVOICE_CLOSED,
      invoiceId: payment.invoiceId ? String(payment.invoiceId) : payment.invoiceNumber,
      payload: { invoiceNumber: payment.invoiceNumber, amount: payAmount },
    })
  }

  return { success: true, status, revenueRecognized, amount: payAmount }
}

export async function processPaymentWebhook(rawBody, signatureHeader, payload) {
  const db = await getDb()

  const isMock = payload?.provider === 'mock' || String(payload?.event || '').startsWith('mock.')
  if (!isMock) {
    if (!verifyWebhookSignature(rawBody, signatureHeader || '')) {
      return { success: false, error: 'INVALID_WEBHOOK_SIGNATURE', status: 401 }
    }
  }

  const eventId = payload?.event_id || payload?.payload?.payment?.entity?.id || `${payload?.event}_${Date.now()}`
  const existingEvent = await db.collection('webhook_events').findOne({ eventId })
  if (existingEvent) {
    return { success: true, duplicate: true, event: payload?.event }
  }

  await db.collection('webhook_events').insertOne({
    eventId,
    event: payload?.event,
    processedAt: new Date(),
  })

  const event = payload?.event || ''
  if (event === 'payment.captured' || event === 'mock.payment.captured') {
    const orderId = payload?.payload?.payment?.entity?.order_id || payload?.orderId
    const paymentId = payload?.payload?.payment?.entity?.id || payload?.paymentId

    const payment = await findPaymentByOrderId(db, orderId)
    if (!payment) return { success: true, event, warning: 'payment_not_found' }

    const capture = await completePayment(db, payment, { paymentId, source: 'webhook' })

    const subscription = await db.collection('subscriptions').findOne({
      orgId: payment.orgId,
      status: 'PENDING',
    })

    if (subscription) {
      await db.collection('subscriptions').updateOne(
        { _id: subscription._id },
        { $set: { status: 'ACTIVE', activatedAt: new Date(), updatedAt: new Date() } }
      )

      const totalAmount = subscription.amount + Math.round(subscription.amount * 0.18)
      const invoiceNumber = `INV-${Date.now()}`
      const companyName = await getTenantCompanyName(db, payment.orgId)
      const productName = await getTenantProductName(db, payment.orgId)
      const invoiceResult = await db.collection('invoices').insertOne({
        invoiceNumber,
        clientName: `${companyName} Subscription`,
        company: companyName,
        product: productName,
        source: 'subscription',
        subtotal: subscription.amount,
        gstPercent: 18,
        gstAmount: Math.round(subscription.amount * 0.18),
        totalAmount,
        status: 'PAID',
        orgId: payment.orgId,
        createdAt: new Date(),
        updatedAt: new Date(),
        paidAt: new Date(),
      })

      if (!capture.revenueRecognized) {
        await recognizeInvoicePayment(payment.orgId, {
          _id: invoiceResult.insertedId,
          invoiceNumber,
          clientName: `${companyName} Subscription`,
          totalAmount,
          status: 'PAID',
        })
      }

      const referral = await db.collection('partner_referrals').findOne({ orgId: payment.orgId, status: 'ACTIVE' })
      if (referral) {
        await recordPartnerCommission(payment.orgId, {
          partnerId: referral.partnerId,
          invoiceId: String(invoiceResult.insertedId),
          invoiceNumber,
          revenueAmount: totalAmount,
        })
      }
    }

    return { success: true, event, ...capture }
  }

  if (event === 'payment.failed' || event === 'mock.payment.failed') {
    const orderId = payload?.payload?.payment?.entity?.order_id || payload?.orderId
    const payment = await findPaymentByOrderId(db, orderId)
    if (payment) {
      await db.collection('payments').updateOne(
        { _id: payment._id },
        { $set: { status: 'FAILED', updatedAt: new Date() } }
      )
    }
    return { success: true, event, status: 'FAILED' }
  }

  return { success: true, event, ignored: true }
}

export async function processRefund(orgId, { paymentId, amount, reason = '' }) {
  const db = await getDb()
  const payment = await db.collection('payments').findOne({ _id: paymentId, orgId })
  if (!payment) throw new Error('Payment not found')

  await db.collection('payments').updateOne(
    { _id: payment._id },
    { $set: { status: 'REFUNDED', refundedAt: new Date(), updatedAt: new Date() } }
  )

  if (payment.invoiceId) {
    await recordRefund(orgId, { invoiceId: String(payment.invoiceId), amount: amount || payment.amount, reason })
  }

  return { success: true, status: 'REFUNDED', amount: amount || payment.amount }
}

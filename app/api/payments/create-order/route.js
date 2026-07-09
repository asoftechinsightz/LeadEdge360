export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { initiateMockPayment } from '@/lib/payments/service'
import { getRazorpay } from '@/lib/razorpay'
import { guardPaymentRequest, paymentError } from '@/lib/payments/api-helpers'

export async function POST(req) {
  try {
    const { orgId } = await guardPaymentRequest(req)
    const body = await req.json()
    const amount = Number(body.amount || 0)
    if (amount <= 0) return NextResponse.json({ success: false, error: 'INVALID_AMOUNT' }, { status: 400 })

    const razorpay = getRazorpay()
    if (!razorpay || body.useMock) {
      return NextResponse.json(await initiateMockPayment(orgId, { ...body, amount }))
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `LE360-${Date.now()}`,
    })

    const db = await getDb()
    await db.collection('payments').insertOne({
      orgId,
      razorpayOrderId: order.id,
      razorpay_order_id: order.id,
      amount,
      invoiceNumber: body.invoiceNumber || null,
      invoiceId: body.invoiceId || null,
      customerId: body.customerId || null,
      provider: 'razorpay',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true, order, provider: 'razorpay' })
  } catch (error) {
    return paymentError(error)
  }
}

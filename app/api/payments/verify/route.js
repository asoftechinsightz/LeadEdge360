export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { verifyCheckoutPayment } from '@/lib/payments/service'
import { guardPaymentRequest, paymentError } from '@/lib/payments/api-helpers'

export async function POST(req) {
  try {
    const body = await req.json()
    if (body.razorpay_order_id && body.razorpay_payment_id && body.razorpay_signature) {
      const { orgId } = await guardPaymentRequest(req)
      return NextResponse.json(await verifyCheckoutPayment(orgId, {
        order_id: body.razorpay_order_id,
        payment_id: body.razorpay_payment_id,
        signature: body.razorpay_signature,
      }))
    }
    const { verifyCheckoutSignature } = await import('@/lib/razorpay')
    const valid = verifyCheckoutSignature({
      order_id: body.razorpay_order_id,
      payment_id: body.razorpay_payment_id,
      signature: body.razorpay_signature,
    })
    return NextResponse.json({ success: valid, verified: valid })
  } catch (error) {
    return paymentError(error)
  }
}

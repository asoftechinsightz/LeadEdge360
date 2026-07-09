export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { initiateMockPayment, captureMockPayment } from '@/lib/payments/service'
import { guardPaymentRequest, paymentError } from '@/lib/payments/api-helpers'

export async function POST(req) {
  try {
    const { orgId } = await guardPaymentRequest(req)
    const body = await req.json()
    const initiated = await initiateMockPayment(orgId, body)
    if (body.autoCapture) {
      const captured = await captureMockPayment(orgId, initiated.orderId, { fail: body.fail })
      return NextResponse.json({ ...initiated, ...captured })
    }
    return NextResponse.json(initiated)
  } catch (error) {
    return paymentError(error)
  }
}

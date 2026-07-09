export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { captureMockPayment } from '@/lib/payments/service'
import { guardPaymentRequest, paymentError } from '@/lib/payments/api-helpers'

export async function POST(req) {
  try {
    const { orgId } = await guardPaymentRequest(req)
    const body = await req.json()
    const result = await captureMockPayment(orgId, body.orderId, { partialAmount: body.partialAmount, fail: body.fail })
    return NextResponse.json(result)
  } catch (error) {
    return paymentError(error)
  }
}

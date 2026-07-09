export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { processRefund } from '@/lib/payments/service'
import { guardPaymentRequest, paymentError } from '@/lib/payments/api-helpers'
import { ObjectId } from 'mongodb'

export async function POST(req) {
  try {
    const { orgId } = await guardPaymentRequest(req)
    const body = await req.json()
    const result = await processRefund(orgId, {
      paymentId: new ObjectId(body.paymentId),
      amount: body.amount,
      reason: body.reason,
    })
    return NextResponse.json(result)
  } catch (error) {
    return paymentError(error)
  }
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { processPaymentWebhook } from '@/lib/payments/service'

export async function POST(req) {
  const rawBody = await req.text()
  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ success: false, error: 'INVALID_JSON' }, { status: 400 })
  }

  const signature = req.headers.get('x-razorpay-signature') || ''
  const result = await processPaymentWebhook(rawBody, signature, payload)
  const status = result.error === 'INVALID_WEBHOOK_SIGNATURE' ? 401 : 200
  return NextResponse.json(result, { status })
}

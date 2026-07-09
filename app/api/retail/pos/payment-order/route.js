export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardRetailRequest, retailError } from '@/lib/retail/api-helpers'
import { createRetailPaymentOrder } from '@/lib/retail/payments/service'

export async function POST(req) {
  try {
    const { orgId, user } = await guardRetailRequest(req)
    const db = await getDb()
    const body = await req.json()
    const data = await createRetailPaymentOrder(db, orgId, user.id, body)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    if (error.message === 'RAZORPAY_NOT_CONFIGURED') {
      return NextResponse.json(
        { success: false, code: error.message, message: error.detail, configured: false },
        { status: 503 },
      )
    }
    return retailError(error)
  }
}

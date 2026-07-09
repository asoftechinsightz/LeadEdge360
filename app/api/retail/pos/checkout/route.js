export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardRetailRequest, retailError } from '@/lib/retail/api-helpers'
import { checkout } from '@/lib/retail/sales/service'
import { checkoutWithPayment } from '@/lib/retail/payments/service'

function requestMeta(req) {
  return {
    ip: req.headers.get('x-forwarded-for') || '',
    ua: req.headers.get('user-agent') || '',
  }
}

export async function POST(req) {
  try {
    const { orgId, user } = await guardRetailRequest(req)
    const db = await getDb()
    const body = await req.json()
    const meta = { ...requestMeta(req), userRole: user.role }
    const data = await checkoutWithPayment(db, orgId, user.id, body, meta)
    return NextResponse.json({ success: true, ...data }, { status: 201 })
  } catch (error) {
    return retailError(error)
  }
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardExpiryRequest, retailError, requestMeta } from '@/lib/retail/expiry/api-helpers'
import { getReturn, updateReturnStatus, generateReturnChallan } from '@/lib/retail/expiry/returns'

export async function GET(req, { params }) {
  try {
    const { orgId } = await guardExpiryRequest(req)
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const data = await getReturn(db, orgId, params.id)
    if (searchParams.get('challan') === 'true') {
      return NextResponse.json({ success: true, challan: generateReturnChallan(data.return) })
    }
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

export async function PUT(req, { params }) {
  try {
    const { orgId, user } = await guardExpiryRequest(req, { action: 'approve_return' })
    const db = await getDb()
    const body = await req.json()
    const meta = requestMeta(req)
    const data = await updateReturnStatus(db, orgId, user.id, params.id, body, meta)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

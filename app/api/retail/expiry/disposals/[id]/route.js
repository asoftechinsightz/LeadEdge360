export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardExpiryRequest, retailError, requestMeta } from '@/lib/retail/expiry/api-helpers'
import { getDisposal, updateDisposalStatus } from '@/lib/retail/expiry/disposals'

export async function GET(req, { params }) {
  try {
    const { orgId } = await guardExpiryRequest(req)
    const db = await getDb()
    const data = await getDisposal(db, orgId, params.id)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

export async function PUT(req, { params }) {
  try {
    const { orgId, user } = await guardExpiryRequest(req, { action: 'dispose' })
    const db = await getDb()
    const body = await req.json()
    const meta = requestMeta(req)
    const data = await updateDisposalStatus(db, orgId, user.id, params.id, body, meta)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

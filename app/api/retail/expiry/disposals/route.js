export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardExpiryRequest, retailError, requestMeta } from '@/lib/retail/expiry/api-helpers'
import { listDisposals, createDisposal } from '@/lib/retail/expiry/disposals'

export async function GET(req) {
  try {
    const { orgId } = await guardExpiryRequest(req)
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())
    const data = await listDisposals(db, orgId, params)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId, user } = await guardExpiryRequest(req, { action: 'dispose' })
    const db = await getDb()
    const body = await req.json()
    const meta = requestMeta(req)
    const data = await createDisposal(db, orgId, user.id, body, meta)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardExpiryRequest, retailError } from '@/lib/retail/expiry/api-helpers'
import { listExpiryAuditLogs } from '@/lib/retail/expiry/audit'

export async function GET(req) {
  try {
    const { orgId } = await guardExpiryRequest(req)
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())
    const data = await listExpiryAuditLogs(db, orgId, params)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardExpiryRequest, retailError, requestMeta } from '@/lib/retail/expiry/api-helpers'
import { getExpiryDashboard } from '@/lib/retail/expiry/dashboard'

export async function GET(req) {
  try {
    const { orgId } = await guardExpiryRequest(req)
    const db = await getDb()
    const data = await getExpiryDashboard(db, orgId)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

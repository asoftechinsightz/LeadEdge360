export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardExpiryRequest, retailError } from '@/lib/retail/expiry/api-helpers'
import { runAlertEngine } from '@/lib/retail/expiry/alerts'

export async function POST(req) {
  try {
    const { orgId } = await guardExpiryRequest(req)
    const db = await getDb()
    const data = await runAlertEngine(db, orgId)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

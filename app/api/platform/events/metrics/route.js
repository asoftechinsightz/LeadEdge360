import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { getEventMetrics } from '@/lib/events/monitoring'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const metrics = await getEventMetrics(db, orgId)
    return NextResponse.json({ success: true, metrics })
  } catch (error) {
    return crmError(error)
  }
}

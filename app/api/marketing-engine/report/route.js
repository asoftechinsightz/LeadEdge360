import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { crmError } from '@/lib/api/route-guards'
import { getLatestDailyReport } from '@/lib/marketing-engine/ceo-marketing-agent'
import { COLLECTIONS } from '@/lib/marketing-engine/constants'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'daily'

    if (type === 'daily') {
      const report = await getLatestDailyReport(db, orgId)
      return NextResponse.json({ success: true, report })
    }

    const reports = await db.collection(COLLECTIONS.REPORTS)
      .find({ orgId, type }, { projection: { _id: 0 } })
      .sort({ day: -1 })
      .limit(10)
      .toArray()

    return NextResponse.json({ success: true, reports })
  } catch (error) {
    return crmError(error)
  }
}

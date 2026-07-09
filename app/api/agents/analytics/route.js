import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { getWorkforceAnalytics } from '@/lib/agents/workforce-analytics'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const url = new URL(req.url)
    const sinceDays = Number(url.searchParams.get('sinceDays') || 30)
    const analytics = await getWorkforceAnalytics(db, orgId, { sinceDays })
    return NextResponse.json({ success: true, analytics })
  } catch (error) {
    return crmError(error)
  }
}

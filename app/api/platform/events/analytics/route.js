import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { computeEventAnalytics } from '@/lib/events/analytics'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const { searchParams } = new URL(req.url)
    const db = await getDb()
    const analytics = await computeEventAnalytics(db, orgId, {
      days: Number(searchParams.get('days') || 30),
    })
    return NextResponse.json({ success: true, analytics })
  } catch (error) {
    return crmError(error)
  }
}

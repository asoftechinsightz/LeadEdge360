import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { getRecentActivities } from '@/lib/activities/recent-activities'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit')
    const db = await getDb()
    const data = await getRecentActivities(db, orgId, { limit })
    return NextResponse.json(data)
  } catch (error) {
    return crmError(error)
  }
}

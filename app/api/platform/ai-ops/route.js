import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { getAIOpsDashboard } from '@/lib/events/analytics'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const data = await getAIOpsDashboard(db, orgId)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return crmError(error)
  }
}

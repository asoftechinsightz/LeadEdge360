import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { listAgentTimeline } from '@/lib/events/analytics'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const { searchParams } = new URL(req.url)
    const db = await getDb()
    const data = await listAgentTimeline(db, orgId, {
      agentId: searchParams.get('agentId'),
      type: searchParams.get('type'),
      status: searchParams.get('status'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      limit: searchParams.get('limit'),
      cursor: searchParams.get('cursor'),
    })
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return crmError(error)
  }
}

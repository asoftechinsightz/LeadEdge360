import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { listAgentTasks } from '@/lib/agents/service'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const { searchParams } = new URL(req.url)
    const db = await getDb()
    const data = await listAgentTasks(db, orgId, {
      agentId: searchParams.get('agentId'),
      status: searchParams.get('status'),
      limit: searchParams.get('limit'),
      cursor: searchParams.get('cursor'),
    })
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return crmError(error)
  }
}

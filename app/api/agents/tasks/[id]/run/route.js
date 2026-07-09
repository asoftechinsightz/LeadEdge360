import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { runAgentTask } from '@/lib/agents/service'

export const dynamic = 'force-dynamic'

export async function POST(req, { params }) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const task = await runAgentTask(db, orgId, params.id)
    return NextResponse.json({ success: true, task })
  } catch (error) {
    return crmError(error)
  }
}

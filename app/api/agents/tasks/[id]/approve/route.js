import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { approveAgentTask } from '@/lib/agents/service'

export const dynamic = 'force-dynamic'

export async function POST(req, { params }) {
  try {
    const tenant = await guardPlatformRequest(req)
    const db = await getDb()
    const userId = tenant.user?.id || tenant.user?.email || 'admin'
    const task = await approveAgentTask(db, tenant.orgId, params.id, userId)
    return NextResponse.json({ success: true, task })
  } catch (error) {
    return crmError(error)
  }
}

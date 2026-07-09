import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import {
  retryFailedTasks,
  replayFailedWebhooks,
  rebuildAgentMemory,
  rebuildNotifications,
  recoverFromOutage,
  RECOVERY_RUNBOOK,
} from '@/lib/agents/disaster-recovery'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ success: true, runbook: RECOVERY_RUNBOOK })
}

export async function POST(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const body = await req.json()
    const { action, ...params } = body

    let result
    switch (action) {
      case 'retry_tasks':
        result = await retryFailedTasks(db, orgId, params)
        break
      case 'replay_webhooks':
        result = await replayFailedWebhooks(db, orgId, params)
        break
      case 'rebuild_memory':
        result = await rebuildAgentMemory(db, orgId, params)
        break
      case 'rebuild_notifications':
        result = await rebuildNotifications(db, orgId, params)
        break
      case 'recover_outage':
        result = await recoverFromOutage(db, orgId, params)
        break
      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    return crmError(error)
  }
}

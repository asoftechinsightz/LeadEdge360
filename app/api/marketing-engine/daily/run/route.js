import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { crmError } from '@/lib/api/route-guards'
import { runFullDailyPipeline, runDailyOrchestrator } from '@/lib/marketing-engine/daily-orchestrator'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(req) {
  try {
    const cronSecret = process.env.AGENT_CRON_SECRET || process.env.CRON_SECRET
    const authHeader = req.headers.get('authorization') || ''
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`

    const db = await getDb()
    const body = await req.json().catch(() => ({}))
    const skipLlm = body.skipLlm ?? body.quick ?? (isCron ? false : true)

    if (isCron && body.orgId) {
      const result = body.full
        ? await runFullDailyPipeline(db, body.orgId, { skipLlm })
        : await runDailyOrchestrator(db, body.orgId, { force: body.force })
      return NextResponse.json({ success: true, mode: 'cron', result })
    }

    const { orgId } = await guardPlatformRequest(req)
    const result = body.full
      ? await runFullDailyPipeline(db, orgId, { skipLlm })
      : await runDailyOrchestrator(db, orgId, { force: body.force })
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('[marketing-engine/daily/run]', error?.message, error?.stack)
    return crmError(error)
  }
}

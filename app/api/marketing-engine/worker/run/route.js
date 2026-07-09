import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { crmError } from '@/lib/api/route-guards'
import { runMarketingEngineWorker } from '@/lib/marketing-engine/worker'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const cronSecret = process.env.AGENT_CRON_SECRET || process.env.CRON_SECRET
    const authHeader = req.headers.get('authorization') || ''
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`

    const db = await getDb()
    const body = await req.json().catch(() => ({}))
    const job = body.job || 'all'

    if (isCron && body.orgId) {
      const report = await runMarketingEngineWorker(db, body.orgId, { job })
      return NextResponse.json({ success: true, mode: 'cron', report })
    }

    const { orgId } = await guardPlatformRequest(req)
    const report = await runMarketingEngineWorker(db, orgId, { job })
    return NextResponse.json({ success: true, mode: 'org', report })
  } catch (error) {
    return crmError(error)
  }
}

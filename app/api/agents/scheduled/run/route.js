import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { runScheduledAgentJobs, runScheduledJobsForAllOrgs, runScoringTrainingForAllOrgs } from '@/lib/agents/scheduled-jobs'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const cronSecret = process.env.AGENT_CRON_SECRET || process.env.CRON_SECRET
    const authHeader = req.headers.get('authorization') || ''
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`

    const db = await getDb()

    if (isCron) {
      const reports = await runScheduledJobsForAllOrgs(db)
      const scoring = await runScoringTrainingForAllOrgs(db)
      return NextResponse.json({ success: true, mode: 'cron', orgCount: reports.length, reports, scoring })
    }

    const { orgId } = await guardPlatformRequest(req)
    const result = await runScheduledAgentJobs(db, orgId)
    return NextResponse.json({ success: true, mode: 'org', result })
  } catch (error) {
    return crmError(error)
  }
}

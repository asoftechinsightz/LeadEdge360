export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { processScheduledCampaigns } from '@/lib/campaigns/campaigns'
import { guardPlatformRequest } from '@/lib/api/platform-guard'

export async function POST(req) {
  try {
    const cronSecret = process.env.AGENT_CRON_SECRET || process.env.CRON_SECRET
    const authHeader = req.headers.get('authorization') || ''
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`

    const db = await getDb()

    if (isCron) {
      const orgs = await db.collection('orgs').find({}, { projection: { id: 1 } }).limit(500).toArray()
      const reports = []
      for (const org of orgs) {
        reports.push({
          orgId: org.id,
          ...(await processScheduledCampaigns(org.id)),
        })
      }
      return NextResponse.json({ success: true, mode: 'cron', orgCount: reports.length, reports })
    }

    const { orgId } = await guardPlatformRequest(req)
    const result = await processScheduledCampaigns(orgId)
    return NextResponse.json({ success: true, mode: 'org', result })
  } catch (error) {
    return crmError(error)
  }
}

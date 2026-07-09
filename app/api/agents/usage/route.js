import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { getUsageSummary, checkUsageBudget, getApprovalRate } from '@/lib/agents/cost-management'
import { getOrgAiSettings } from '@/lib/agents/org-config'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const url = new URL(req.url)
    const sinceHours = Number(url.searchParams.get('sinceHours') || 168)
    const groupBy = url.searchParams.get('groupBy') || 'agent'

    const settings = await getOrgAiSettings(db, orgId)
    const [usage, budget, approval] = await Promise.all([
      getUsageSummary(db, orgId, { sinceHours, groupBy }),
      checkUsageBudget(db, orgId, settings),
      getApprovalRate(db, orgId, { sinceHours }),
    ])

    return NextResponse.json({ success: true, usage, budget, approval, limits: settings })
  } catch (error) {
    return crmError(error)
  }
}

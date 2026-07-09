import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { getMarketingDashboard } from '@/lib/marketing-engine/analytics'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const { searchParams } = new URL(req.url)
    const db = await getDb()
    const dashboard = await getMarketingDashboard(db, orgId, {
      sinceDays: parseInt(searchParams.get('sinceDays') || '30', 10),
    })
    return NextResponse.json({ success: true, dashboard })
  } catch (error) {
    return crmError(error)
  }
}

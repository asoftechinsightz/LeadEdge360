import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getOpportunityDashboard } from '@/lib/opportunities/service'

export async function GET(request) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const dashboard = await getOpportunityDashboard(orgId)
    return NextResponse.json({ success: true, ...dashboard })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Failed to load dashboard' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'

import { listCampaignActivities } from '@/lib/campaigns/activity'

import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export async function GET(request, { params }) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const data = await listCampaignActivities(orgId, params.id)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to load activities' }, { status: 500 })
  }
}

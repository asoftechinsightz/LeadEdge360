import { NextResponse } from 'next/server'

import { renderCampaignTemplate } from '@/lib/campaigns/campaigns'

import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export async function POST(request) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const body = await request.json()
    const data = await renderCampaignTemplate(orgId, body)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
}

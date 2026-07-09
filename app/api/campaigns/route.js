import { NextResponse } from 'next/server'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { createCampaign, listCampaigns } from '@/lib/campaigns/campaigns'

export async function GET(request) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const { searchParams } = new URL(request.url)
    const data = await listCampaigns(orgId, searchParams.get('page'), searchParams.get('limit'))
    return NextResponse.json(data)
  } catch (error) {
    return crmError(error)
  }
}

export async function POST(request) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const body = await request.json()
    const data = await createCampaign(orgId, body)
    return NextResponse.json(data)
  } catch (error) {
    return crmError(error)
  }
}

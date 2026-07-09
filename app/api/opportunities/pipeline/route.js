import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

import { getPipelineItems } from '@/lib/opportunities/service'

export async function GET(request) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const items = await getPipelineItems(orgId)
    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Failed to load pipeline' }, { status: 500 })
  }
}

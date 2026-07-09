import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

import { movePipelineStage } from '@/lib/opportunities/service'

export async function POST(request) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const body = await request.json()
    if (!body.leadId || !body.status) {
      return NextResponse.json({ success: false, error: 'leadId and status required' }, { status: 400 })
    }
    const result = await movePipelineStage(orgId, body.leadId, body.status, { reason: body.reason })
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to move stage' },
      { status: error.message === 'Lead not found' ? 404 : 400 }
    )
  }
}

import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createOpportunityRecord } from '@/lib/opportunities/service'

export async function POST(request) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const body = await request.json()
    const item = await createOpportunityRecord({
      orgId,
      leadId: body.leadId,
      company: body.company,
      name: body.name,
      owner: body.owner,
      expectedValue: body.expectedValue,
    })
    return NextResponse.json({ success: true, item }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create opportunity' },
      { status: error.message === 'Lead not found' ? 404 : 500 }
    )
  }
}

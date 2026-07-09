import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { updateOpportunityRecord } from '@/lib/opportunities/service'

export async function POST(request) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const body = await request.json()
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
    }
    const opportunity = await updateOpportunityRecord(orgId, body.id, {
      expectedValue: body.expectedValue,
    })
    return NextResponse.json({ success: true, opportunity })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update value' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import {
  createOpportunityRecord,
  listOpportunities,
} from '@/lib/opportunities/service'

export async function GET(request) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const { searchParams } = new URL(request.url)
    const items = await listOpportunities(orgId, {
      stage: searchParams.get('stage') || undefined,
      status: searchParams.get('status') || undefined,
    })
    return NextResponse.json({ success: true, items })
  } catch (error) {
    return crmError(error)
  }
}

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
    const status = error.message === 'Lead not found' ? 404 : (error.message === 'UNAUTHORIZED' ? 401 : 500)
    return NextResponse.json({ success: false, error: error.message || 'Failed to create opportunity' }, { status })
  }
}

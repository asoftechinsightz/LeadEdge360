export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import {
  deleteOpportunityRecord,
  getOpportunity,
  updateOpportunityRecord,
} from '@/lib/opportunities/service'

export async function GET(request, { params }) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const data = await getOpportunity(orgId, params.id)
    if (!data?.opportunity) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return crmError(error)
  }
}

export async function PATCH(request, { params }) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const body = await request.json()
    const opportunity = await updateOpportunityRecord(orgId, params.id, body)
    return NextResponse.json({ success: true, opportunity })
  } catch (error) {
    const status = error.message === 'Opportunity not found' ? 404 : 500
    return NextResponse.json({ success: false, error: error.message || 'Failed to update opportunity' }, { status })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { orgId } = await guardCrmRequest(request)
    await deleteOpportunityRecord(orgId, params.id)
    return NextResponse.json({ success: true, ok: true })
  } catch (error) {
    const status = error.message === 'Opportunity not found' ? 404 : 500
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete opportunity' }, { status })
  }
}

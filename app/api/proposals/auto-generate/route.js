import { guardProposalRequest, crmError } from '@/lib/api/route-guards'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { autoGenerateProposalFromLead } from '@/lib/proposals/service'

export async function POST(req) {
  try {
    const { orgId } = await guardProposalRequest(req)
    const body = await req.json()
    const proposal = await autoGenerateProposalFromLead(orgId, body.leadId)
    return NextResponse.json({ success: true, proposal })
  } catch (error) {
    const status = error.message === 'Lead not found' ? 404 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

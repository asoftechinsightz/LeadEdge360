import { NextResponse } from 'next/server'
import { createProposalFromOpportunity } from '@/lib/proposals/service'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export async function POST(req, { params }) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const proposal = await createProposalFromOpportunity(orgId, params.id)
    return NextResponse.json({ success: true, proposal, proposalId: proposal.id })
  } catch (error) {
    const status = error.message === 'Opportunity not found' ? 404 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

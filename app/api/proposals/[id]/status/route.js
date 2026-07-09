import { NextResponse } from 'next/server'
import { updateProposal } from '@/lib/proposals/service'
import { guardProposalRequest, crmError } from '@/lib/api/route-guards'

export async function POST(req, { params }) {
  try {
    const { orgId } = await guardProposalRequest(req)
    const body = await req.json()
    await updateProposal(orgId, params.id, { status: body.status })
    return NextResponse.json({ success: true })
  } catch (error) {
    const status = error.message === 'Proposal not found' ? 404 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

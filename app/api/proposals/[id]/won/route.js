import { NextResponse } from 'next/server'
import { markProposalWon } from '@/lib/proposals/service'
import { guardProposalRequest, crmError } from '@/lib/api/route-guards'

export async function POST(req, { params }) {
  try {
    const { orgId } = await guardProposalRequest(req)
    const data = await markProposalWon(orgId, params.id)
    return NextResponse.json(data)
  } catch (error) {
    const status = error.message === 'Proposal not found' ? 404 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

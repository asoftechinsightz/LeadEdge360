import { NextResponse } from 'next/server'
import { guardProposalRequest, crmError } from '@/lib/api/route-guards'
import { duplicateProposal } from '@/lib/documents/service'

export async function POST(req, { params }) {
  try {
    const { orgId, user } = await guardProposalRequest(req)
    const proposal = await duplicateProposal(orgId, params.id, { userId: user?.id || user?.email, req })
    return NextResponse.json({ success: true, proposal })
  } catch (error) {
    return crmError(error)
  }
}

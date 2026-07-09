import { NextResponse } from 'next/server'
import { guardProposalRequest, crmError } from '@/lib/api/route-guards'
import { getDocumentHistory } from '@/lib/documents/service'
import { getProposalDetail } from '@/lib/proposals/service'

export async function GET(req, { params }) {
  try {
    const { orgId } = await guardProposalRequest(req)
    const proposal = await getProposalDetail(params.id, orgId)
    if (!proposal) {
      return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 })
    }
    const history = await getDocumentHistory(orgId, 'proposal', params.id)
    return NextResponse.json({ success: true, ...history })
  } catch (error) {
    return crmError(error)
  }
}

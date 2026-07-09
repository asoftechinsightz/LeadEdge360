import { NextResponse } from 'next/server'

import { guardProposalRequest, crmError } from '@/lib/api/route-guards'
import { getProposalDetail, updateProposal, deleteProposal } from '@/lib/proposals/service'

export async function GET(request, { params }) {
  try {
    const { orgId } = await guardProposalRequest(request)
    const proposal = await getProposalDetail(params.id, orgId)
    if (!proposal) {
      return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, proposal })
  } catch (error) {
    return crmError(error)
  }
}

export async function PATCH(request, { params }) {
  try {
    const { orgId, user } = await guardProposalRequest(request)

    const body = await request.json()
    const proposal = await updateProposal(orgId, params.id, body, { userId: user?.id || null })
    return NextResponse.json({ success: true, proposal })
  } catch (error) {
    return crmError(error)
  }
}

export async function PUT(request, { params }) {
  return PATCH(request, { params })
}

export async function DELETE(request, { params }) {
  try {
    const { orgId } = await guardProposalRequest(request)

    const data = await deleteProposal(orgId, params.id)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

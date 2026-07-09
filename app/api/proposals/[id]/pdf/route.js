import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardProposalRequest, crmError } from '@/lib/api/route-guards'
import { getOrgBranding } from '@/lib/branding/service'
import { logDocumentAction } from '@/lib/documents/service'
import { getProposalDetail } from '@/lib/proposals/service'
import { generateProposalPdf } from '@/lib/pdf/proposal-generator'

export async function GET(req, { params }) {
  try {
    const { orgId, user } = await guardProposalRequest(req)
    const proposal = await getProposalDetail(params.id, orgId)
    if (!proposal) {
      return NextResponse.json({ success: false }, { status: 404 })
    }

    const db = await getDb()
  const branding = await getOrgBranding(db, orgId)
  const pdf = await generateProposalPdf(proposal, branding)

  await logDocumentAction({
    orgId,
    userId: user?.id || user?.email,
    action: 'proposal.pdf_download',
    docType: 'proposal',
    docId: params.id,
    detail: proposal.proposalNumber,
    req,
  })

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${proposal.proposalNumber}.pdf`,
    },
  })
  } catch (error) {
    return crmError(error)
  }
}

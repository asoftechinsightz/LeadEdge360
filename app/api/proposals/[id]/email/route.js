import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardProposalRequest, crmError } from '@/lib/api/route-guards'
import { getOrgBranding } from '@/lib/branding/service'
import { logDocumentAction } from '@/lib/documents/service'
import { getProposalDetail } from '@/lib/proposals/service'
import { generateProposalPdf } from '@/lib/pdf/proposal-generator'
import { getSmtpReadiness } from '@/lib/campaigns/smtp'

export async function POST(req, { params }) {
  try {
    const { orgId, user } = await guardProposalRequest(req)
    const body = await req.json()

    const proposal = await getProposalDetail(params.id, orgId)
    if (!proposal) {
      return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 })
    }

    const smtp = getSmtpReadiness()
    if (!smtp.ready) {
      return NextResponse.json({
        success: true,
        mode: 'dry_run',
        message: 'SMTP not configured — email not sent',
        proposalNumber: proposal.proposalNumber,
      })
    }

    const db = await getDb()
    const branding = await getOrgBranding(db, orgId)
    const pdfBuffer = await generateProposalPdf(proposal, branding)
    const { createTransporter } = await import('@/lib/email/transporter')
    const transporter = createTransporter()

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: body.email,
      subject: `Proposal ${proposal.proposalNumber}`,
      html: `
        <h2>${proposal.company}</h2>
        <p>Proposal Number: ${proposal.proposalNumber}</p>
        <p>Total Amount: Rs ${proposal.totalAmount}</p>
      `,
      attachments: [{
        filename: `${proposal.proposalNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    })

    await logDocumentAction({
      orgId,
      userId: user?.id || user?.email,
      action: 'proposal.email',
      docType: 'proposal',
      docId: params.id,
      detail: `Sent to ${body.email}`,
      req,
    })

    return NextResponse.json({ success: true, mode: 'live' })
  } catch (error) {
    return crmError(error)
  }
}

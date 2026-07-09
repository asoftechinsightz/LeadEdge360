import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongo'
import { getOrgBranding } from '@/lib/branding/service'
import { logDocumentAction } from '@/lib/documents/service'
import { generateInvoicePdf } from '@/lib/pdf/invoice-generator'
import { guardRevenueRequest, revenueError } from '@/lib/revenue/api-helpers'
import { getSmtpReadiness } from '@/lib/campaigns/smtp'

export async function POST(req, { params }) {
  try {
    const { orgId, user } = await guardRevenueRequest(req, { permission: 'invoices' })
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid invoice id' }, { status: 400 })
    }

    const body = await req.json()
    const db = await getDb()
    const invoice = await db.collection('invoices').findOne({ _id: new ObjectId(params.id), orgId })
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    const branding = await getOrgBranding(db, orgId)
    const smtp = getSmtpReadiness()
    if (!smtp.ready) {
      return NextResponse.json({
        success: true,
        mode: 'dry_run',
        message: 'SMTP not configured — email not sent',
        invoiceNumber: invoice.invoiceNumber,
      })
    }

    const pdfBuffer = await generateInvoicePdf(invoice, branding)
    const { createTransporter } = await import('@/lib/email/transporter')
    const transporter = createTransporter()

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: body.email,
      subject: `Invoice ${invoice.invoiceNumber}`,
      html: `
        <h2>${invoice.company || invoice.clientName}</h2>
        <p>Invoice Number: ${invoice.invoiceNumber}</p>
        <p>Total Amount: ₹${invoice.totalAmount}</p>
        <p>Please find your GST invoice attached.</p>
      `,
      attachments: [{
        filename: `${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    })

    await logDocumentAction({
      orgId,
      userId: user?.id || user?.email,
      action: 'invoice.email',
      docType: 'invoice',
      docId: params.id,
      detail: `Sent to ${body.email}`,
      req,
    })

    return NextResponse.json({ success: true, mode: 'live' })
  } catch (error) {
    return revenueError(error)
  }
}

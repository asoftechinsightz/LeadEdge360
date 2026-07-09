import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongo'
import { applyInvoicePayment, recordPendingPayment, recordRefund } from '@/lib/revenue/service'
import { guardRevenueRequest, revenueError } from '@/lib/revenue/api-helpers'
import { getOrgBranding } from '@/lib/branding/service'
import { generateInvoicePdf } from '@/lib/pdf/invoice-generator'
import { logDocumentAction } from '@/lib/documents/service'

export async function GET(req, { params }) {
  try {
    const { orgId, user } = await guardRevenueRequest(req, { permission: 'invoices' })
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid invoice id' }, { status: 400 })
    }
    const db = await getDb()
    const invoice = await db.collection('invoices').findOne({ _id: new ObjectId(params.id), orgId })
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const wantsJson = searchParams.get('format') === 'json'
      || (req.headers.get('accept') || '').includes('application/json')

    if (wantsJson) {
      return NextResponse.json({
        success: true,
        invoice: { ...invoice, id: String(invoice._id) },
      })
    }

    const branding = await getOrgBranding(db, orgId)
    const pdf = await generateInvoicePdf(invoice, branding)

    await logDocumentAction({
      orgId,
      userId: user?.id || user?.email,
      action: 'invoice.pdf_download',
      docType: 'invoice',
      docId: params.id,
      detail: invoice.invoiceNumber,
      req,
    })

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${invoice.invoiceNumber || 'invoice'}.pdf`,
      },
    })
  } catch (error) {
    return revenueError(error)
  }
}

export async function POST(req, { params }) {
  try {
    const { orgId, user } = await guardRevenueRequest(req, { permission: 'invoices' })
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid invoice id' }, { status: 400 })
    }

    const body = await req.json()
    const action = body.action || 'pay'
    const db = await getDb()
    const invoice = await db.collection('invoices').findOne({ _id: new ObjectId(params.id), orgId })
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    if (action === 'pay' || action === 'partial_pay') {
      const defaultAmount = action === 'partial_pay'
        ? Number(body.amount)
        : Number(body.amount ?? invoice.totalAmount)
      const result = await applyInvoicePayment(orgId, invoice, { amount: defaultAmount })
      await logDocumentAction({
        orgId,
        userId: user?.id || user?.email,
        action: action === 'partial_pay' ? 'invoice.partial_payment' : 'invoice.payment',
        docType: 'invoice',
        docId: params.id,
        detail: `₹${defaultAmount}`,
        req,
      })
      return NextResponse.json(result)
    }

    if (action === 'pending') {
      const pending = await recordPendingPayment(orgId, invoice)
      await db.collection('invoices').updateOne(
        { _id: invoice._id, orgId },
        { $set: { status: 'PENDING', updatedAt: new Date() } }
      )
      return NextResponse.json({ success: true, pending })
    }

    if (action === 'cancel') {
      await db.collection('invoices').updateOne(
        { _id: invoice._id, orgId },
        { $set: { status: 'CANCELLED', updatedAt: new Date() } }
      )
      return NextResponse.json({ success: true, cancelled: true })
    }

    if (action === 'refund') {
      const refund = await recordRefund(orgId, {
        invoiceId: String(invoice._id),
        amount: body.amount || invoice.totalAmount,
        reason: body.reason || '',
      })
      return NextResponse.json({ success: true, refund })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    return revenueError(error)
  }
}

export async function PATCH(req, { params }) {
  try {
    const { orgId } = await guardRevenueRequest(req, { permission: 'invoices' })
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid invoice id' }, { status: 400 })
    }
    const body = await req.json()
    const db = await getDb()
    const allowed = ['clientName', 'company', 'subtotal', 'gstPercent', 'gstAmount', 'totalAmount', 'status', 'items']
    const $set = { updatedAt: new Date() }
    for (const key of allowed) {
      if (body[key] !== undefined) $set[key] = body[key]
    }
    const result = await db.collection('invoices').findOneAndUpdate(
      { _id: new ObjectId(params.id), orgId },
      { $set },
      { returnDocument: 'after' },
    )
    const invoice = result?.value ?? result
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, invoice: { ...invoice, id: String(invoice._id) } })
  } catch (error) {
    return revenueError(error)
  }
}

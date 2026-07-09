export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { recognizeInvoicePayment, recordPendingPayment } from '@/lib/revenue/service'
import { guardRevenueRequest, revenueError } from '@/lib/revenue/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardRevenueRequest(req)
    const db = await getDb()
    const payments = await db.collection('payments').find({ orgId }).sort({ createdAt: -1 }).toArray()
    return NextResponse.json({ success: true, count: payments.length, payments })
  } catch (error) {
    return revenueError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId } = await guardRevenueRequest(req)
    const db = await getDb()
    const body = await req.json()

    const payment = {
      ...body,
      orgId,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('payments').insertOne(payment)

    if (body.invoiceNumber) {
      const invoice = await db.collection('invoices').findOne({ invoiceNumber: body.invoiceNumber, orgId })
      if (invoice) {
        if (body.markPaid) {
          await recognizeInvoicePayment(orgId, invoice, { paymentId: String(result.insertedId), amount: body.amount })
        } else {
          await recordPendingPayment(orgId, invoice)
          await db.collection('invoices').updateOne(
            { _id: invoice._id, orgId },
            { $set: { status: 'PENDING', updatedAt: new Date() } }
          )
        }
      }
    }

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    return revenueError(error)
  }
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardRevenueRequest, revenueError } from '@/lib/revenue/api-helpers'
import { getTenantProductName } from '@/lib/branding/tenant-defaults'

export async function GET(req) {
  try {
    const { orgId } = await guardRevenueRequest(req, { permission: 'invoices' })
    const db = await getDb()
    const invoices = await db.collection('invoices').find({ orgId }).sort({ createdAt: -1 }).toArray()
    return NextResponse.json({ success: true, count: invoices.length, invoices })
  } catch (error) {
    return revenueError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId } = await guardRevenueRequest(req, { permission: 'invoices' })
    const body = await req.json()
    const db = await getDb()
    const productName = body.product || await getTenantProductName(db, orgId)
    const invoice = {
      invoiceNumber: body.invoiceNumber || `INV-${Date.now()}`,
      orgId,
      clientName: body.clientName || '',
      company: body.company || '',
      product: productName,
      territory: body.territory || null,
      source: body.source || 'manual',
      subtotal: body.subtotal || 0,
      gstPercent: body.gstPercent ?? 18,
      gstAmount: body.gstAmount || 0,
      totalAmount: body.totalAmount || 0,
      items: Array.isArray(body.items) ? body.items : [],
      status: body.status || 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await db.collection('invoices').insertOne(invoice)
    return NextResponse.json({ success: true, invoiceId: result.insertedId, invoice: { ...invoice, _id: result.insertedId } })
  } catch (error) {
    return revenueError(error)
  }
}

import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongo'
import { guardRevenueRequest, revenueError } from '@/lib/revenue/api-helpers'
import { getDocumentHistory } from '@/lib/documents/service'

export async function GET(req, { params }) {
  try {
    const { orgId } = await guardRevenueRequest(req, { permission: 'invoices' })
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid invoice id' }, { status: 400 })
    }
    const db = await getDb()
    const invoice = await db.collection('invoices').findOne({ _id: new ObjectId(params.id), orgId })
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }
    const history = await getDocumentHistory(orgId, 'invoice', params.id)
    return NextResponse.json({ success: true, ...history })
  } catch (error) {
    return revenueError(error)
  }
}

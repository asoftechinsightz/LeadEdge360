import { NextResponse } from 'next/server'
import { guardRevenueRequest, revenueError } from '@/lib/revenue/api-helpers'
import { duplicateInvoice } from '@/lib/documents/service'

export async function POST(req, { params }) {
  try {
    const { orgId, user } = await guardRevenueRequest(req, { permission: 'invoices' })
    const invoice = await duplicateInvoice(orgId, params.id, { userId: user?.id || user?.email, req })
    return NextResponse.json({ success: true, invoice })
  } catch (error) {
    return revenueError(error)
  }
}

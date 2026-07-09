import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCustomerRequest, customerError } from '@/lib/customers/api-helpers'

export async function GET(request, { params }) {
  try {
    const { orgId } = await guardCustomerRequest(request)
    const db = await getDb()
    const items = await db.collection('customer_activities')
      .find({ orgId, customerId: params.id }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 }).limit(50).toArray()
    return NextResponse.json({ success: true, items })
  } catch (error) {
    return customerError(error)
  }
}

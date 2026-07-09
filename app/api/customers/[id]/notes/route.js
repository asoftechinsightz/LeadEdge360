import { NextResponse } from 'next/server'
import { addCustomerNote } from '@/lib/customers/service'
import { guardCustomerRequest, customerError } from '@/lib/customers/api-helpers'

export async function POST(request, { params }) {
  try {
    const { orgId } = await guardCustomerRequest(request)
    const body = await request.json()
    return NextResponse.json(await addCustomerNote(orgId, params.id, body.body || body.note))
  } catch (error) {
    return customerError(error)
  }
}

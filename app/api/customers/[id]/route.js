import { NextResponse } from 'next/server'
import { getCustomer, updateCustomer, deleteCustomer, addCustomerNote } from '@/lib/customers/service'
import { guardCustomerRequest, customerError } from '@/lib/customers/api-helpers'

export async function GET(request, { params }) {
  try {
    const { orgId } = await guardCustomerRequest(request)
    const customer = await getCustomer(orgId, params.id)
    if (!customer) return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 })
    return NextResponse.json({ success: true, customer })
  } catch (error) {
    return customerError(error)
  }
}

export async function PATCH(request, { params }) {
  try {
    const { orgId } = await guardCustomerRequest(request)
    const body = await request.json()
    return NextResponse.json(await updateCustomer(orgId, params.id, body))
  } catch (error) {
    return customerError(error)
  }
}

export async function PUT(request, { params }) {
  return PATCH(request, { params })
}

export async function DELETE(request, { params }) {
  try {
    const { orgId } = await guardCustomerRequest(request)
    return NextResponse.json(await deleteCustomer(orgId, params.id))
  } catch (error) {
    return customerError(error)
  }
}

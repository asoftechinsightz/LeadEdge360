export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import {
  createCustomer, listCustomers, getCustomerDashboard, exportCustomersCsv,
} from '@/lib/customers/service'
import { guardCustomerRequest, customerError } from '@/lib/customers/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardCustomerRequest(req)
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format')
    if (format === 'csv') {
      const data = await exportCustomersCsv(orgId)
      return new Response(data.csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=customers-export.csv',
          'X-Row-Count': String(data.rowCount),
        },
      })
    }
    if (searchParams.get('dashboard') === '1') {
      return NextResponse.json(await getCustomerDashboard(orgId))
    }
    const data = await listCustomers(orgId, {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      q: searchParams.get('q') || '',
      status: searchParams.get('status'),
    })
    return NextResponse.json(data)
  } catch (error) {
    return customerError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId } = await guardCustomerRequest(req)
    const body = await req.json()
    return NextResponse.json(await createCustomer(orgId, body))
  } catch (error) {
    return customerError(error)
  }
}

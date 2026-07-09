import { NextResponse } from 'next/server'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { listSalesLeads } from '@/lib/sales/leads'

export async function GET(request) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const { searchParams } = new URL(request.url)
    const data = await listSalesLeads(orgId, {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      label: searchParams.get('label'),
      q: searchParams.get('q'),
    })
    return NextResponse.json(data)
  } catch (error) {
    return crmError(error)
  }
}

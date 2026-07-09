export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getCustomerDashboard } from '@/lib/customers/service'
import { guardCustomerRequest, customerError } from '@/lib/customers/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardCustomerRequest(req)
    return NextResponse.json(await getCustomerDashboard(orgId))
  } catch (error) {
    return customerError(error)
  }
}

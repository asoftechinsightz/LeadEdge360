export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getRevenueByCustomer } from '@/lib/revenue/service'
import { guardRevenueRequest, revenueError } from '@/lib/revenue/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardRevenueRequest(req)
    return NextResponse.json(await getRevenueByCustomer(orgId))
  } catch (error) {
    return revenueError(error)
  }
}

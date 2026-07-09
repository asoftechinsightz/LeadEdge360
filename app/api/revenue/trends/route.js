export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getRevenueTrends } from '@/lib/revenue/service'
import { guardRevenueRequest, revenueError } from '@/lib/revenue/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardRevenueRequest(req)
    const { searchParams } = new URL(req.url)
    const months = parseInt(searchParams.get('months') || '6', 10)
    return NextResponse.json(await getRevenueTrends(orgId, { months }))
  } catch (error) {
    return revenueError(error)
  }
}

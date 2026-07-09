export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getRevenueSummary } from '@/lib/revenue/service'
import { guardRevenueRequest, revenueError } from '@/lib/revenue/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardRevenueRequest(req)
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || null
    return NextResponse.json(await getRevenueSummary(orgId, { period }))
  } catch (error) {
    return revenueError(error)
  }
}

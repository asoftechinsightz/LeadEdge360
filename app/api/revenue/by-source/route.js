export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getRevenueBySource, getRevenueByTerritory } from '@/lib/revenue/service'
import { guardRevenueRequest, revenueError } from '@/lib/revenue/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardRevenueRequest(req)
    const { searchParams } = new URL(req.url)
    const dimension = searchParams.get('dimension') || 'source'
    const data = dimension === 'territory'
      ? await getRevenueByTerritory(orgId)
      : await getRevenueBySource(orgId)
    return NextResponse.json(data)
  } catch (error) {
    return revenueError(error)
  }
}

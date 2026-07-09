export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { exportRevenueCsv } from '@/lib/revenue/service'
import { guardRevenueRequest, revenueError } from '@/lib/revenue/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardRevenueRequest(req)
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'csv'
    const period = searchParams.get('period') || null

    if (format === 'csv') {
      const data = await exportRevenueCsv(orgId, { period })
      return new Response(data.csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=revenue-export.csv',
          'X-Row-Count': String(data.rowCount),
          'X-Total-Recognized': String(data.totalRecognized),
        },
      })
    }

    return NextResponse.json({ success: false, error: 'Unsupported format. Use csv.' }, { status: 400 })
  } catch (error) {
    return revenueError(error)
  }
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardExpiryRequest, retailError } from '@/lib/retail/expiry/api-helpers'
import { generateReport, exportReportCsv, REPORT_TYPES } from '@/lib/retail/expiry/reports'

export async function GET(req) {
  try {
    const { orgId } = await guardExpiryRequest(req, { action: 'bulk_export' })
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'batch'
    const format = searchParams.get('format') || 'json'
    const params = Object.fromEntries(searchParams.entries())

    if (!REPORT_TYPES.includes(type)) {
      return NextResponse.json({ success: true, types: REPORT_TYPES })
    }

    const report = await generateReport(db, orgId, type, params)

    if (format === 'csv') {
      const csv = exportReportCsv(report)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="expiry-${type}-report.csv"`,
        },
      })
    }

    return NextResponse.json({ success: true, report })
  } catch (error) {
    return retailError(error)
  }
}

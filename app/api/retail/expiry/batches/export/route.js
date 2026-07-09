export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardExpiryRequest, retailError } from '@/lib/retail/expiry/api-helpers'
import { exportBatches } from '@/lib/retail/expiry/batches'
import { exportReportCsv } from '@/lib/retail/expiry/reports'

export async function GET(req) {
  try {
    const { orgId } = await guardExpiryRequest(req, { action: 'bulk_export' })
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'json'
    const params = Object.fromEntries(searchParams.entries())
    const items = await exportBatches(db, orgId, params)

    if (format === 'csv') {
      const csv = exportReportCsv({ rows: items.map((b) => ({
        batchNumber: b.batchNumber,
        productName: b.productName,
        productSku: b.productSku,
        supplier: b.supplier,
        warehouse: b.warehouseName,
        expiryDate: b.expiryDate,
        quantityAvailable: b.quantityAvailable,
        batchStatus: b.batchStatus,
        daysRemaining: b.daysRemaining,
      })) })
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="batches-export.csv"',
        },
      })
    }

    return NextResponse.json({ success: true, items, total: items.length })
  } catch (error) {
    return retailError(error)
  }
}

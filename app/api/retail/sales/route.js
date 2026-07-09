export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardRetailRequest, retailError } from '@/lib/retail/api-helpers'
import { listSales } from '@/lib/retail/sales/service'

export async function GET(req) {
  try {
    const { orgId } = await guardRetailRequest(req)
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const data = await listSales(db, orgId, { limit })
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

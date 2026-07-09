export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardExpiryRequest, retailError } from '@/lib/retail/expiry/api-helpers'
import { scannerLookup } from '@/lib/retail/expiry/batches'

export async function GET(req) {
  try {
    const { orgId } = await guardExpiryRequest(req)
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code') || searchParams.get('barcode') || searchParams.get('sku')
    const data = await scannerLookup(db, orgId, code)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

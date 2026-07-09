export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardRetailRequest, retailError } from '@/lib/retail/api-helpers'
import { lookupSku } from '@/lib/retail/sales/service'

export async function GET(req) {
  try {
    const { orgId } = await guardRetailRequest(req)
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const sku = searchParams.get('sku') || searchParams.get('barcode') || ''
    const data = await lookupSku(db, orgId, sku)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

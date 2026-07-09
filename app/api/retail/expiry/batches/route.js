export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardExpiryRequest, retailError, requestMeta } from '@/lib/retail/expiry/api-helpers'
import { listBatches, createBatch, bulkImportBatches, bulkUpdateBatches, bulkDeleteBatches } from '@/lib/retail/expiry/batches'

export async function GET(req) {
  try {
    const { orgId } = await guardExpiryRequest(req)
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())
    const data = await listBatches(db, orgId, params)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId, user } = await guardExpiryRequest(req, { action: 'edit_batch' })
    const db = await getDb()
    const body = await req.json()
    const meta = { ...requestMeta(req), userRole: user.role }

    if (body.bulk === 'import' && Array.isArray(body.rows)) {
      const results = await bulkImportBatches(db, orgId, user.id, body.rows, meta)
      return NextResponse.json({ success: true, ...results })
    }
    if (body.bulk === 'update' && Array.isArray(body.ids)) {
      const results = await bulkUpdateBatches(db, orgId, user.id, body.ids, body.updates || {}, meta)
      return NextResponse.json({ success: true, ...results })
    }
    if (body.bulk === 'delete' && Array.isArray(body.ids)) {
      const results = await bulkDeleteBatches(db, orgId, user.id, body.ids, meta)
      return NextResponse.json({ success: true, ...results })
    }

    const data = await createBatch(db, orgId, user.id, body, meta)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

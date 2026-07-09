export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardRetailRequest, retailError } from '@/lib/retail/api-helpers'
import { repredictSku } from '@/lib/retail/inventory/service'

function requestMeta(req) {
  return {
    ip: req.headers.get('x-forwarded-for') || '',
    ua: req.headers.get('user-agent') || '',
  }
}

export async function POST(req, { params }) {
  try {
    const { orgId, user } = await guardRetailRequest(req)
    const db = await getDb()
    const data = await repredictSku(db, orgId, user.id, params.id, requestMeta(req))
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

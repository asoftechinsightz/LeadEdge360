export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardRetailRequest, retailError } from '@/lib/retail/api-helpers'
import { listInventory, createSku } from '@/lib/retail/inventory/service'

function requestMeta(req) {
  return {
    ip: req.headers.get('x-forwarded-for') || '',
    ua: req.headers.get('user-agent') || '',
  }
}

export async function GET(req) {
  try {
    const { orgId, user } = await guardRetailRequest(req)
    const db = await getDb()
    const data = await listInventory(db, orgId, user.id)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId, user } = await guardRetailRequest(req)
    const db = await getDb()
    const body = await req.json()
    const data = await createSku(db, orgId, user.id, body, requestMeta(req))
    return NextResponse.json({ success: true, ...data }, { status: 201 })
  } catch (error) {
    return retailError(error)
  }
}

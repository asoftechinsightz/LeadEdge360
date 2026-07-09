export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardRetailRequest, retailError } from '@/lib/retail/api-helpers'
import { listStores } from '@/lib/retail/inventory/service'

export async function GET(req) {
  try {
    const { orgId, user } = await guardRetailRequest(req)
    const db = await getDb()
    const data = await listStores(db, orgId, user.id)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

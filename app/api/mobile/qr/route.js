export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardGrowthRequest, growthError } from '@/lib/growth/api-helpers'
import { listQrCodes } from '@/lib/qr/service'

export async function GET(req) {
  try {
    const { orgId } = await guardGrowthRequest(req, { feature: 'qr_engine' })
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const data = await listQrCodes(db, orgId, {
      type: searchParams.get('type'),
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize') || '50',
    })
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return growthError(error)
  }
}

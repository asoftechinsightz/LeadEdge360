export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardGrowthRequest, growthError } from '@/lib/growth/api-helpers'
import { getOrgQrSummary } from '@/lib/qr/service'

export async function GET(req) {
  try {
    const { orgId } = await guardGrowthRequest(req, { feature: 'qr_engine' })
    const db = await getDb()
    const data = await getOrgQrSummary(db, orgId)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return growthError(error)
  }
}

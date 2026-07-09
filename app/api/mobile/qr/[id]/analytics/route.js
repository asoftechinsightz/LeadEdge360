export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardGrowthRequest, growthError } from '@/lib/growth/api-helpers'
import { getQrAnalytics } from '@/lib/qr/track'

export async function GET(req, { params }) {
  try {
    const { orgId } = await guardGrowthRequest(req, { feature: 'qr_engine' })
    const db = await getDb()
    const data = await getQrAnalytics(db, orgId, params.id)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return growthError(error)
  }
}

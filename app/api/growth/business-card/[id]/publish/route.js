export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardGrowthRequest, growthError } from '@/lib/growth/api-helpers'
import { publishBusinessCard } from '@/lib/growth/business-card/service'

function requestMeta(req) {
  return {
    ip: req.headers.get('x-forwarded-for') || '',
    ua: req.headers.get('user-agent') || '',
  }
}

export async function POST(req, { params }) {
  try {
    const { orgId, user } = await guardGrowthRequest(req, { feature: 'business_card' })
    const db = await getDb()
    const data = await publishBusinessCard(db, orgId, user.id, params.id, requestMeta(req))
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return growthError(error)
  }
}

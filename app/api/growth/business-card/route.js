export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardGrowthRequest, growthError } from '@/lib/growth/api-helpers'
import { createBusinessCard, listBusinessCards } from '@/lib/growth/business-card/service'

function requestMeta(req) {
  return {
    ip: req.headers.get('x-forwarded-for') || '',
    ua: req.headers.get('user-agent') || '',
  }
}

export async function GET(req) {
  try {
    const { orgId } = await guardGrowthRequest(req, { feature: 'business_card' })
    const db = await getDb()
    const data = await listBusinessCards(db, orgId)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return growthError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId, user } = await guardGrowthRequest(req, { feature: 'business_card' })
    const db = await getDb()
    const body = await req.json()
    const data = await createBusinessCard(db, orgId, user.id, body, requestMeta(req))
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return growthError(error)
  }
}

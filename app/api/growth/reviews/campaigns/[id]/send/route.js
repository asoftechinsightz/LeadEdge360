export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardGrowthRequest, growthError } from '@/lib/growth/api-helpers'
import { sendReviewRequest } from '@/lib/growth/reviews/service'

function requestMeta(req) {
  return {
    ip: req.headers.get('x-forwarded-for') || '',
    ua: req.headers.get('user-agent') || '',
  }
}

export async function POST(req, { params }) {
  try {
    const { orgId, user } = await guardGrowthRequest(req, { feature: 'reviews' })
    const db = await getDb()
    const body = await req.json()
    const data = await sendReviewRequest(db, orgId, user.id, params.id, body, requestMeta(req))
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return growthError(error)
  }
}

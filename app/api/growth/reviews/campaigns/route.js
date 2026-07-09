export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardGrowthRequest, growthError } from '@/lib/growth/api-helpers'
import { createCampaign, listCampaigns } from '@/lib/growth/reviews/service'

function requestMeta(req) {
  return {
    ip: req.headers.get('x-forwarded-for') || '',
    ua: req.headers.get('user-agent') || '',
  }
}

export async function GET(req) {
  try {
    const { orgId } = await guardGrowthRequest(req, { feature: 'reviews' })
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const data = await listCampaigns(db, orgId, {
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
    })
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return growthError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId, user } = await guardGrowthRequest(req, { feature: 'reviews' })
    const db = await getDb()
    const body = await req.json()
    const data = await createCampaign(db, orgId, user.id, body, requestMeta(req))
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return growthError(error)
  }
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardGrowthRequest, growthError } from '@/lib/growth/api-helpers'
import { getReviewSummary, listRequests } from '@/lib/growth/reviews/service'

export async function GET(req) {
  try {
    const { orgId } = await guardGrowthRequest(req, { feature: 'reviews' })
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    if (searchParams.get('scope') === 'requests') {
      const data = await listRequests(db, orgId, {
        campaignId: searchParams.get('campaignId'),
        page: searchParams.get('page'),
        pageSize: searchParams.get('pageSize'),
      })
      return NextResponse.json({ success: true, ...data })
    }
    const data = await getReviewSummary(db, orgId)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return growthError(error)
  }
}

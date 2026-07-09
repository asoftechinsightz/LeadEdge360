export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { runLeadScoring } from '@/lib/lead-scoring/run-scoring'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()
    const collection = db.collection('lead_scores')

    const [hot, warm, cold] = await Promise.all([
      collection.countDocuments({ orgId, classification: 'HOT' }),
      collection.countDocuments({ orgId, classification: 'WARM' }),
      collection.countDocuments({ orgId, classification: 'COLD' }),
    ])

    return NextResponse.json({
      success: true,
      orgId,
      hot,
      warm,
      cold,
    })
  } catch (error) {
    return crmError(error)
  }
}

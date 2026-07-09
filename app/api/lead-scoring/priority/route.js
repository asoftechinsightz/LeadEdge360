export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()

    const items = await db.collection('lead_scores')
      .find({ orgId })
      .sort({ score: -1 })
      .limit(100)
      .toArray()

    return NextResponse.json({
      success: true,
      orgId,
      items,
    })
  } catch (error) {
    return crmError(error)
  }
}

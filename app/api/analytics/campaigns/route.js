export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()

    const items = await db.collection('campaign_executions')
      .aggregate([
        { $match: { orgId } },
        {
          $group: {
            _id: '$campaignId',
            runs: { $sum: 1 },
            leads: { $sum: '$totalLeads' },
          },
        },
      ])
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

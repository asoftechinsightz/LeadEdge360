export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()

    const [scanned, leads, executions] = await Promise.all([
      db.collection('scanner_results').countDocuments({ orgId }),
      db.collection('leads').countDocuments({ orgId }),
      db.collection('campaign_executions').countDocuments({ orgId }),
    ])

    return NextResponse.json({
      success: true,
      orgId,
      funnel: {
        scanned,
        leads,
        executions,
      },
    })
  } catch (error) {
    return crmError(error)
  }
}

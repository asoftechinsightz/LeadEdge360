export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { calculateAttributionSummary } from '@/lib/analytics/roi-calculator'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()
    const summary = await calculateAttributionSummary(db, orgId)
    return NextResponse.json({ success: true, ...summary })
  } catch (error) {
    return crmError(error)
  }
}

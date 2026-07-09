export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { calculateChannelRoi } from '@/lib/analytics/roi-calculator'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const url = new URL(req.url)
    const model = url.searchParams.get('model') || 'last_touch'
    const days = Number(url.searchParams.get('days') || 90)

    const db = await getDb()
    const result = await calculateChannelRoi(db, orgId, { model, days })
    return NextResponse.json(result)
  } catch (error) {
    return crmError(error)
  }
}

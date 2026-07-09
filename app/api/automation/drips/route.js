export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { listDripTemplates } from '@/lib/campaigns/drip'

export async function GET(req) {
  try {
    await guardCrmRequest(req)
    return NextResponse.json({ success: true, items: listDripTemplates() })
  } catch (error) {
    return crmError(error)
  }
}

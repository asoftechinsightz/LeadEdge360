export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { activateDripTemplate } from '@/lib/campaigns/drip'

export async function POST(req, { params }) {
  try {
    const { orgId, user } = await guardCrmRequest(req)
    const db = await getDb()
    const result = await activateDripTemplate(db, orgId, params.id, user.id)
    return NextResponse.json({ success: true, ...result }, { status: result.alreadyActive ? 200 : 201 })
  } catch (error) {
    return crmError(error)
  }
}

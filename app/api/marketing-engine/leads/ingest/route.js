import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { ingestMarketingLead, ingestLeadBatch } from '@/lib/marketing-engine/lead-ingest'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const { orgId, user } = await guardCrmRequest(req)
    const body = await req.json()
    const db = await getDb()

    if (Array.isArray(body.leads)) {
      const result = await ingestLeadBatch(db, orgId, body.leads, { userId: user.id })
      return NextResponse.json({ success: true, result })
    }

    const result = await ingestMarketingLead(db, orgId, body, { userId: user.id })
    return NextResponse.json({ success: true, result }, { status: result.duplicate ? 200 : 201 })
  } catch (error) {
    return crmError(error)
  }
}

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { processAgentQueue } from '@/lib/agents/service'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const body = await req.json().catch(() => ({}))
    const db = await getDb()
    const results = await processAgentQueue(db, orgId, { limit: body.limit || 10 })
    return NextResponse.json({ success: true, processed: results.length, results })
  } catch (error) {
    return crmError(error)
  }
}

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { crmError } from '@/lib/api/route-guards'
import { publishDueContent } from '@/lib/marketing-engine/publisher'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const body = await req.json().catch(() => ({}))
    const db = await getDb()
    const result = await publishDueContent(db, orgId, { limit: body.limit || 20 })
    return NextResponse.json({ success: true, result })
  } catch (error) {
    return crmError(error)
  }
}

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { listContent } from '@/lib/marketing-engine/content-store'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const { searchParams } = new URL(req.url)
    const db = await getDb()
    const data = await listContent(db, orgId, {
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      platform: searchParams.get('platform') || undefined,
      weekId: searchParams.get('weekId') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 50,
    })
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return crmError(error)
  }
}

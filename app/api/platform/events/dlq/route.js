import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { listDeadLetterEvents, exportDeadLetterEvents } from '@/lib/events/dlq'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const { searchParams } = new URL(req.url)
    const db = await getDb()

    if (searchParams.get('export') === 'true') {
      const items = await exportDeadLetterEvents(db, orgId)
      return NextResponse.json({ success: true, items, count: items.length })
    }

    const data = await listDeadLetterEvents(db, orgId, {
      status: searchParams.get('status') || null,
      limit: searchParams.get('limit'),
      skip: Number(searchParams.get('skip') || 0),
    })
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return crmError(error)
  }
}

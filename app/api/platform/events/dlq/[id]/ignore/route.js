import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { ignoreDeadLetterEvent } from '@/lib/events/dlq'

export const dynamic = 'force-dynamic'

export async function POST(req, { params }) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const entry = await ignoreDeadLetterEvent(db, orgId, params.id)
    if (!entry) {
      return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 })
    }
    return NextResponse.json({ success: true, entry })
  } catch (error) {
    return crmError(error)
  }
}

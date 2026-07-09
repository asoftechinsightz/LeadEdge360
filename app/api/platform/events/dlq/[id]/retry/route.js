import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { retryDeadLetterEvent } from '@/lib/events/dlq'
import { EVENT_PROCESSORS } from '@/lib/events/processors'

export const dynamic = 'force-dynamic'

export async function POST(req, { params }) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()

    const result = await retryDeadLetterEvent(db, orgId, params.id, {
      replayFn: async (event, processorName) => {
        const processor = EVENT_PROCESSORS[processorName]
        if (!processor) throw new Error(`Unknown processor: ${processorName}`)
        await processor.run(event, db)
      },
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return crmError(error)
  }
}

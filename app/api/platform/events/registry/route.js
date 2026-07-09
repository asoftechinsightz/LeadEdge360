import { NextResponse } from 'next/server'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { listEventSchemas } from '@/lib/events/schema-registry'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    await guardPlatformRequest(req)
    const schemas = listEventSchemas()
    return NextResponse.json({ success: true, count: schemas.length, schemas })
  } catch (error) {
    return crmError(error)
  }
}

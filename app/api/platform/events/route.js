import { NextResponse } from 'next/server'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { listPlatformEvents } from '@/lib/events/bus'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req, {
      roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'admin', 'superadmin'],
    })
    const { searchParams } = new URL(req.url)
    const data = await listPlatformEvents(orgId, {
      limit: searchParams.get('limit'),
      type: searchParams.get('type'),
    })
    return NextResponse.json(data)
  } catch (error) {
    return crmError(error)
  }
}

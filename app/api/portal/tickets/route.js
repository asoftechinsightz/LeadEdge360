export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { resolvePortalSession, createSupportTicket } from '@/lib/portal/service'
import { portalError } from '@/lib/portal/api-helpers'

export async function POST(req) {
  try {
    const { orgId, customerId } = resolvePortalSession(req)
    const body = await req.json()
    return NextResponse.json(await createSupportTicket(orgId, customerId, body))
  } catch (error) {
    return portalError(error)
  }
}

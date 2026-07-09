export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { resolvePortalSession, getPortalPayments } from '@/lib/portal/service'
import { portalError } from '@/lib/portal/api-helpers'

export async function GET(req) {
  try {
    const { orgId, customerId } = resolvePortalSession(req)
    return NextResponse.json(await getPortalPayments(orgId, customerId))
  } catch (error) {
    return portalError(error)
  }
}

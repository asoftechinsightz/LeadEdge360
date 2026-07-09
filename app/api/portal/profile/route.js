export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { resolvePortalSession, getPortalProfile, updatePortalProfile } from '@/lib/portal/service'
import { portalError } from '@/lib/portal/api-helpers'

export async function GET(req) {
  try {
    const { orgId, customerId } = resolvePortalSession(req)
    return NextResponse.json(await getPortalProfile(orgId, customerId))
  } catch (error) {
    return portalError(error)
  }
}

export async function PATCH(req) {
  try {
    const { orgId, customerId } = resolvePortalSession(req)
    const body = await req.json()
    return NextResponse.json(await updatePortalProfile(orgId, customerId, body))
  } catch (error) {
    return portalError(error)
  }
}

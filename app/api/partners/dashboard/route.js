export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getPartnerDashboard } from '@/lib/partners/service'
import { guardPartnerRequest, partnerError } from '@/lib/partners/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardPartnerRequest(req, { partnerOnly: true })
    return NextResponse.json(await getPartnerDashboard(orgId))
  } catch (error) {
    return partnerError(error)
  }
}

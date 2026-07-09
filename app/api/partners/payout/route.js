export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { processPayout } from '@/lib/partners/service'
import { guardPartnerRequest, partnerError } from '@/lib/partners/api-helpers'

export async function POST(req) {
  try {
    const { orgId } = await guardPartnerRequest(req)
    const body = await req.json()
    return NextResponse.json(await processPayout(orgId, body.commissionId))
  } catch (error) {
    return partnerError(error)
  }
}

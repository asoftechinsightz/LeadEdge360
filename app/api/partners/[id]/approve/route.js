export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { approvePartner } from '@/lib/partners/service'
import { guardPartnerRequest, partnerError } from '@/lib/partners/api-helpers'

export async function POST(req, { params }) {
  try {
    const { orgId } = await guardPartnerRequest(req)
    return NextResponse.json(await approvePartner(orgId, params.id))
  } catch (error) {
    return partnerError(error)
  }
}

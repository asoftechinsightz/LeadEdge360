export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getPartner } from '@/lib/partners/service'
import { guardPartnerRequest, partnerError } from '@/lib/partners/api-helpers'

export async function GET(req, { params }) {
  try {
    const { orgId } = await guardPartnerRequest(req)
    const partner = await getPartner(orgId, params.id)
    if (!partner) return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 })
    return NextResponse.json({ success: true, partner })
  } catch (error) {
    return partnerError(error)
  }
}

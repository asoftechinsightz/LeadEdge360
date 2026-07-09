export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createPartner, listPartners } from '@/lib/partners/service'
import { guardPartnerRequest, partnerError } from '@/lib/partners/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardPartnerRequest(req)
    const { searchParams } = new URL(req.url)
    return NextResponse.json(await listPartners(orgId, { status: searchParams.get('status') }))
  } catch (error) {
    return partnerError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId } = await guardPartnerRequest(req)
    const body = await req.json()
    return NextResponse.json(await createPartner(orgId, body))
  } catch (error) {
    return partnerError(error)
  }
}

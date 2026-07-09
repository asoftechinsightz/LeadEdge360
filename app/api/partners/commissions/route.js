export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { listCommissions } from '@/lib/partners/service'
import { guardPartnerRequest, partnerError } from '@/lib/partners/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardPartnerRequest(req)
    const { searchParams } = new URL(req.url)
    return NextResponse.json(await listCommissions(orgId, {
      partnerId: searchParams.get('partnerId'),
      status: searchParams.get('status'),
    }))
  } catch (error) {
    return partnerError(error)
  }
}

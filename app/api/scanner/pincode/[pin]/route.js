import { NextResponse } from 'next/server'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { resolveIndianPinCode } from '@/lib/scanner/pincode'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    await guardCrmRequest(request)
    const location = await resolveIndianPinCode(params.pin)
    return NextResponse.json({ success: true, location })
  } catch (error) {
    return crmError(error)
  }
}

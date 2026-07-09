export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { portalResetPassword } from '@/lib/portal/service'
import { portalError } from '@/lib/portal/api-helpers'

export async function POST(req) {
  try {
    const body = await req.json()
    return NextResponse.json(await portalResetPassword(body.email, body.newPassword))
  } catch (error) {
    return portalError(error)
  }
}

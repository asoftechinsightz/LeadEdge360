export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { portalLogin } from '@/lib/portal/service'
import { portalError } from '@/lib/portal/api-helpers'

export async function POST(req) {
  try {
    const body = await req.json()
    return NextResponse.json(await portalLogin(body.email, body.password))
  } catch (error) {
    return portalError(error)
  }
}

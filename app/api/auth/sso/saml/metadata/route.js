export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { buildSpMetadata } from '@/lib/auth/sso'

export async function GET(request) {
  const orgId = new URL(request.url).searchParams.get('orgId')
  if (!orgId) {
    return NextResponse.json({ error: 'orgId required' }, { status: 400 })
  }

  const xml = buildSpMetadata(orgId)
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/samlmetadata+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'
import { COOKIE_CONSENT_VERSION } from '@/lib/consent-versions'

/** Anonymous or authenticated cookie preference logging. */
export async function POST(req) {
  try {
    const body = await req.json()
    const db = await getDb()
    await db.collection('cookie_consent_log').insertOne({
      id: randomUUID(),
      essential: true,
      analytics: body.analytics === true,
      performance: body.performance === true,
      marketing: body.marketing === true,
      version: body.version || COOKIE_CONSENT_VERSION,
      acceptedAt: body.acceptedAt || new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
      ua: req.headers.get('user-agent') || '',
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

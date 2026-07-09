export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { recordCardClick } from '@/lib/growth/business-card/service'

const ALLOWED_CHANNELS = new Set(['whatsapp', 'call', 'email', 'website', 'maps'])

export async function POST(req, { params }) {
  try {
    const body = await req.json().catch(() => ({}))
    const channel = String(body.channel || 'whatsapp').toLowerCase()
    if (!ALLOWED_CHANNELS.has(channel)) {
      return NextResponse.json({ success: false, message: 'Invalid channel' }, { status: 400 })
    }

    const db = await getDb()
    await recordCardClick(db, params.slug, channel)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[public-card-click]', error)
    return NextResponse.json({ success: false, message: 'Failed to record click' }, { status: 500 })
  }
}

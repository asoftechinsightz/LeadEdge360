export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { getBusinessCardBySlug, recordCardView, toPublicCard } from '@/lib/growth/business-card/service'

export async function GET(_req, { params }) {
  try {
    const db = await getDb()
    const card = await getBusinessCardBySlug(db, params.slug)
    if (!card) {
      return NextResponse.json({ success: false, message: 'Card not found' }, { status: 404 })
    }

    await recordCardView(db, params.slug)

    return NextResponse.json({
      success: true,
      data: toPublicCard(card),
    })
  } catch (error) {
    console.error('[public-card]', error)
    return NextResponse.json({ success: false, message: 'Failed to load card' }, { status: 500 })
  }
}

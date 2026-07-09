export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import {
  getPublicReviewContext,
  markRequestOpened,
  recordRating,
} from '@/lib/growth/reviews/service'

export async function GET(req, { params }) {
  try {
    const db = await getDb()
    await markRequestOpened(db, params.token)
    const data = await getPublicReviewContext(db, params.token)
    if (!data) {
      return NextResponse.json({ success: false, message: 'Review link not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[public-review]', error)
    return NextResponse.json({ success: false, message: 'Failed to load review' }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const db = await getDb()
    const body = await req.json()
    const data = await recordRating(db, params.token, {
      rating: body.rating,
      comment: body.comment,
    })
    const context = await getPublicReviewContext(db, params.token)
    return NextResponse.json({ success: true, data: { ...data, ...context } })
  } catch (error) {
    const status = error.message === 'NOT_FOUND' ? 404
      : (error.message === 'VALIDATION_FAILED' ? 400 : 500)
    return NextResponse.json(
      { success: false, code: error.message, message: error.detail || error.message },
      { status },
    )
  }
}

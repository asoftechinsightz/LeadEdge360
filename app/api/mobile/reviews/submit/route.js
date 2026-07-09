export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { recordRating } from '@/lib/growth/reviews/service'

export async function POST(req) {
  try {
    const db = await getDb()
    const body = await req.json()
    const token = String(body.token || '').trim()
    if (!token) {
      return NextResponse.json({ success: false, message: 'token is required' }, { status: 400 })
    }
    const data = await recordRating(db, token, {
      rating: body.rating,
      comment: body.comment,
    })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const status = error.message === 'NOT_FOUND' ? 404
      : (error.message === 'VALIDATION_FAILED' ? 400 : 500)
    return NextResponse.json(
      { success: false, code: error.message, message: error.detail || error.message },
      { status },
    )
  }
}

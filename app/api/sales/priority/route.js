export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'

export async function GET() {

  const db = await getDb()

  const items =
    await db.collection('lead_scores')
      .find({})
      .sort({ score: -1 })
      .limit(100)
      .toArray()

  return NextResponse.json({
    success: true,
    items
  })
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { requireAuthenticatedTenant } from '@/lib/tenant'

export async function GET(req) {
  try {
    const { user } = await requireAuthenticatedTenant(req)
    const db = await getDb()
    const history = await db.collection('consent_log')
      .find({ $or: [{ userId: user.id }, { email: user.email }] })
      .sort({ loggedAt: -1, acceptedAt: -1 })
      .limit(25)
      .toArray()
    return NextResponse.json({ success: true, history })
  } catch (error) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

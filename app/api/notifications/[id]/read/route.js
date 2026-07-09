import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { markNotificationRead } from '@/lib/activities/notifications'

export const dynamic = 'force-dynamic'

export async function POST(req, { params }) {
  try {
    const tenant = await guardCrmRequest(req)
    const db = await getDb()
    const notification = await markNotificationRead(db, tenant.orgId, params.id)

    if (!notification) {
      return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    return crmError(error)
  }
}

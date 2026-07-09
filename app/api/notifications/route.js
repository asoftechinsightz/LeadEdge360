import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { listNotifications } from '@/lib/activities/notifications'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const tenant = await guardCrmRequest(req)
    const { searchParams } = new URL(req.url)
    const db = await getDb()
    const userId = tenant.user?.id || tenant.user?.email || null

    const data = await listNotifications(db, tenant.orgId, {
      userId,
      limit: searchParams.get('limit'),
    })

    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return crmError(error)
  }
}

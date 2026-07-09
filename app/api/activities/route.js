import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { listActivities } from '@/lib/activities/service'
import { ACTIVITY_CATEGORIES } from '@/lib/activities/registry'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const tenant = await guardCrmRequest(req)
    const { searchParams } = new URL(req.url)
    const db = await getDb()

    const data = await listActivities(db, tenant.orgId, {
      limit: searchParams.get('limit'),
      cursor: searchParams.get('cursor'),
      category: searchParams.get('filter') || searchParams.get('category') || ACTIVITY_CATEGORIES.ALL,
      search: searchParams.get('search') || searchParams.get('q') || '',
      userId: searchParams.get('mine') === 'true' ? (tenant.user?.id || tenant.user?.email) : null,
      syncLegacy: searchParams.get('sync') !== 'false',
    })

    return NextResponse.json(data)
  } catch (error) {
    return crmError(error)
  }
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { listTerritories, createTerritory, listTerritoriesWithStats } from '@/lib/territories/service'

export async function GET(req) {
  try {
    const { orgId, user } = await guardCrmRequest(req)
    const db = await getDb()
    const url = new URL(req.url)
    if (url.searchParams.get('stats') === '1') {
      const items = await listTerritoriesWithStats(db, orgId, user?.id || 'system')
      return NextResponse.json({ success: true, items })
    }
    return NextResponse.json({ success: true, ...(await listTerritories(db, orgId)) })
  } catch (error) {
    return crmError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId, user } = await guardCrmRequest(req)
    const db = await getDb()
    const body = await req.json()
    const data = await createTerritory(db, orgId, user.id, body)
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return crmError(error)
  }
}

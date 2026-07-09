export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { updateTerritory } from '@/lib/territories/service'

export async function PATCH(req, { params }) {
  try {
    const { orgId, user } = await guardCrmRequest(req)
    const db = await getDb()
    const body = await req.json()
    const data = await updateTerritory(db, orgId, user.id, params.id, body)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return crmError(error)
  }
}

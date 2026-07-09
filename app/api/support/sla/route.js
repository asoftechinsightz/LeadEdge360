export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { getOrgSupportProfile } from '@/lib/support/zendesk'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()
    const profile = await getOrgSupportProfile(db, orgId)
    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    return crmError(error)
  }
}

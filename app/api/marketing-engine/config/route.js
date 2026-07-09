import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { crmError } from '@/lib/api/route-guards'
import { getMarketingConfig, updateMarketingConfig } from '@/lib/marketing-engine/config'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const config = await getMarketingConfig(db, orgId)
    return NextResponse.json({ success: true, config })
  } catch (error) {
    return crmError(error)
  }
}

export async function PATCH(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const body = await req.json()
    const db = await getDb()
    const config = await updateMarketingConfig(db, orgId, body)
    return NextResponse.json({ success: true, config })
  } catch (error) {
    return crmError(error)
  }
}

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { getOrgAiSettings, saveOrgAiSettings } from '@/lib/agents/org-config'
import { getOrgIndustryProfile } from '@/lib/agents/industry-profiles'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const [settings, industry] = await Promise.all([
      getOrgAiSettings(db, orgId),
      getOrgIndustryProfile(db, orgId),
    ])
    return NextResponse.json({ success: true, settings, industry })
  } catch (error) {
    return crmError(error)
  }
}

export async function PUT(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const body = await req.json()
    const settings = await saveOrgAiSettings(db, orgId, body)
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    return crmError(error)
  }
}

export const POST = PUT

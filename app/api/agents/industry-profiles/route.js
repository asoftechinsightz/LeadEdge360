import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import {
  listIndustryProfiles,
  applyIndustryProfile,
  getOrgIndustryProfile,
} from '@/lib/agents/industry-profiles'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const [profiles, current] = await Promise.all([
      Promise.resolve(listIndustryProfiles()),
      getOrgIndustryProfile(db, orgId),
    ])
    return NextResponse.json({ success: true, profiles, current })
  } catch (error) {
    return crmError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const { profileId } = await req.json()
    if (!profileId) {
      return NextResponse.json({ success: false, error: 'profileId required' }, { status: 400 })
    }
    const result = await applyIndustryProfile(db, orgId, profileId)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return crmError(error)
  }
}

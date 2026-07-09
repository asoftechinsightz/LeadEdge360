import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { crmError } from '@/lib/api/route-guards'
import { runResearchAgent, getLatestResearch } from '@/lib/marketing-engine/research-agent'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const research = await getLatestResearch(db, orgId)
    return NextResponse.json({ success: true, research })
  } catch (error) {
    return crmError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const result = await runResearchAgent(db, orgId)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    return crmError(error)
  }
}

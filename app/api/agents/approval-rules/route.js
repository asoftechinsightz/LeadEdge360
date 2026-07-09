import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { getApprovalRules, saveApprovalRule } from '@/lib/agents/approval'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const rules = await getApprovalRules(db, orgId)
    return NextResponse.json({ success: true, rules })
  } catch (error) {
    return crmError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const body = await req.json()
    if (!body?.id || !body?.name) {
      return NextResponse.json({ success: false, error: 'id and name required' }, { status: 400 })
    }
    const rule = await saveApprovalRule(db, orgId, body)
    return NextResponse.json({ success: true, rule })
  } catch (error) {
    return crmError(error)
  }
}

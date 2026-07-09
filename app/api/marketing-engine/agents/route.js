import { NextResponse } from 'next/server'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { MARKETING_AGENTS } from '@/lib/marketing-engine/agents'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    await guardCrmRequest(req)
    return NextResponse.json({ success: true, agents: MARKETING_AGENTS })
  } catch (error) {
    return crmError(error)
  }
}

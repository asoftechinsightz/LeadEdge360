import { NextResponse } from 'next/server'
import { runLeadScoring } from '@/lib/lead-scoring/run-scoring'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const result = await runLeadScoring({ orgId })

    return NextResponse.json({
      success: true,
      orgId,
      ...result,
    })
  } catch (error) {
    return crmError(error)
  }
}

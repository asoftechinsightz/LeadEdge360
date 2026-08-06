export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardAiRequest, aiError } from '@/lib/ai/api-helpers'
import { scoreLeadForOrg } from '@/lib/ai/service'
import { blockedBySoftGate, respondSoftGate } from '@/lib/subscription/server'

export async function POST(req) {
  try {
    const { orgId, gate } = await guardAiRequest(req, { feature: 'ai_scoring' })
    if (blockedBySoftGate(gate)) {
      return respondSoftGate(gate, NextResponse, { hint: 'AI scoring is available on Growth plan and above.' })
    }
    const db = await getDb()
    const body = await req.json()
    const leadId = String(body.leadId || '').trim()
    if (!leadId) {
      const err = new Error('VALIDATION_FAILED')
      err.detail = 'leadId is required'
      throw err
    }
    const data = await scoreLeadForOrg(db, orgId, leadId)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return aiError(error)
  }
}

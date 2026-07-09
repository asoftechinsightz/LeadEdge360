export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardAiRequest, aiError } from '@/lib/ai/api-helpers'
import { suggestLeadReply } from '@/lib/ai/service'

export async function POST(req) {
  try {
    const { orgId } = await guardAiRequest(req)
    const db = await getDb()
    const body = await req.json()
    const leadId = String(body.leadId || '').trim()

    let lead = body.lead
    if (!lead && leadId) {
      lead = await db.collection('leads').findOne({ orgId, id: leadId }, { projection: { _id: 0 } })
    }
    if (!lead) {
      const err = new Error('VALIDATION_FAILED')
      err.detail = 'leadId or lead payload required'
      throw err
    }

    const data = await suggestLeadReply(lead, {
      intent: body.intent || 'followup',
      tone: body.tone || 'professional',
    })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return aiError(error)
  }
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { findLeadById } from '@/lib/leads/service'
import { sendLeadWhatsAppIntro } from '@/lib/whatsapp-service'
import { guardFeatureSoft, blockedBySoftGate, respondSoftGate } from '@/lib/subscription/server'

export async function POST(req, { params }) {
  try {
    const tenant = await guardCrmRequest(req)
    const { orgId, user } = tenant
    const { gate } = await guardFeatureSoft(tenant, 'whatsapp_pro')
    if (blockedBySoftGate(gate)) {
      return respondSoftGate(gate, NextResponse, {
        hint: 'WhatsApp Pro is required to send intro messages.',
      })
    }

    const leadId = params?.id
    if (!leadId) {
      return NextResponse.json({ code: 'VALIDATION_FAILED', message: 'Lead id required' }, { status: 400 })
    }

    const db = await getDb()
    const lead = await findLeadById(db, orgId, leadId)
    if (!lead) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Lead not found' }, { status: 404 })
    }

    const body = await req.json().catch(() => ({}))
    const result = await sendLeadWhatsAppIntro(db, orgId, user.id, lead, {
      ip: req.headers.get('x-forwarded-for') || '',
      ua: req.headers.get('user-agent') || '',
      templateId: body.templateId || 'new_lead',
    })

    return NextResponse.json({
      success: true,
      previewText: result.previewText,
      template: result.template,
      threadId: result.thread?.id,
      messageId: result.message?.id,
      status: result.message?.status,
    }, { status: 201 })
  } catch (error) {
    return crmError(error)
  }
}

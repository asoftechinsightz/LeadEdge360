export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { createOrgSupportTicket, getOrgSupportProfile } from '@/lib/support/zendesk'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()
    const profile = await getOrgSupportProfile(db, orgId)
    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    return crmError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId, user } = await guardCrmRequest(req)
    const body = await req.json()
    const subject = String(body.subject || '').trim()
    const detail = String(body.body || body.message || '').trim()

    if (!subject || !detail) {
      const err = new Error('VALIDATION_FAILED')
      err.detail = 'subject and body are required'
      throw err
    }

    const db = await getDb()
    const result = await createOrgSupportTicket(db, orgId, user, {
      subject,
      body: detail,
      category: body.category || 'general',
    })

    return NextResponse.json({
      success: true,
      ticket: result.ticket,
      routing: result.routing,
      zendesk: result.zendesk,
    }, { status: 201 })
  } catch (error) {
    return crmError(error)
  }
}

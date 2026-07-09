export const dynamic = 'force-dynamic'

import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { DEMO_ORG_ID } from '@/lib/tenant'
import { isProductionMode } from '@/lib/security/production'
import { emitPlatformEvent } from '@/lib/events/bus'
import { PLATFORM_EVENTS } from '@/lib/events/types'

function resolveGrowthAuditOrgId() {
  const orgId = process.env.GROWTH_AUDIT_ORG_ID
  if (orgId) return orgId
  if (isProductionMode()) {
    throw new Error('GROWTH_AUDIT_ORG_ID_REQUIRED')
  }
  return DEMO_ORG_ID
}

const GROWTH_AUDIT_SOURCES = ['website-growth-audit', 'growth-audit']

export async function GET() {
  try {
    const db = await getDb()
    const orgId = resolveGrowthAuditOrgId()
    const recentAudits = await db.collection('leads').countDocuments({
      orgId,
      source: { $in: GROWTH_AUDIT_SOURCES },
    })
    return NextResponse.json({ success: true, recentAudits })
  } catch (error) {
    if (error.message === 'GROWTH_AUDIT_ORG_ID_REQUIRED') {
      return NextResponse.json({ success: true, recentAudits: 0 })
    }
    console.error(error)
    return NextResponse.json({ success: false, recentAudits: 0 }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const db = await getDb()
    const orgId = resolveGrowthAuditOrgId()
    const now = new Date().toISOString()

    const lead = {
      id: randomUUID(),
      orgId,
      name: body.name || '',
      company: body.company || '',
      phone: body.phone || '',
      email: body.email || '',
      industry: body.industry || '',
      website: body.website || '',
      monthlyRevenue: body.monthlyRevenue || '',
      challenge: body.challenge || '',
      source: 'website-growth-audit',
      status: 'NEW',
      assignedTo: 'Sales Team',
      label: 'Warm',
      score: 50,
      reasons: ['Website Growth Audit'],
      createdAt: now,
      updatedAt: now,
    }

    await db.collection('leads').insertOne(lead)

    await emitPlatformEvent({
      db,
      orgId,
      type: PLATFORM_EVENTS.LEAD_CREATED,
      entity: 'lead',
      entityId: lead.id,
      payload: { source: lead.source, company: lead.company },
      source: 'growth-audit',
    })

    return NextResponse.json({
      success: true,
      leadId: lead.id,
    })
  } catch (error) {
    if (error.message === 'GROWTH_AUDIT_ORG_ID_REQUIRED') {
      return NextResponse.json(
        { success: false, error: 'Growth audit is not configured for this environment' },
        { status: 503 },
      )
    }
    console.error(error)
    return NextResponse.json(
      { success: false, error: 'FAILED_TO_CREATE_LEAD' },
      { status: 500 },
    )
  }
}

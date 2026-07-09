export const dynamic = 'force-dynamic'

import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { DEMO_ORG_ID } from '@/lib/tenant'
import { isProductionMode } from '@/lib/security/production'
import { emitPlatformEvent } from '@/lib/events/bus'
import { PLATFORM_EVENTS } from '@/lib/events/types'

function resolveMarketingOrgId() {
  const orgId = process.env.MARKETING_LEAD_ORG_ID || process.env.GROWTH_AUDIT_ORG_ID
  if (orgId) return orgId
  if (isProductionMode()) {
    throw new Error('MARKETING_LEAD_ORG_ID_REQUIRED')
  }
  return DEMO_ORG_ID
}

const SOURCE_LABELS = {
  'book-demo': 'Website Book Demo',
  contact: 'Website Contact',
  'free-trial': 'Website Free Trial',
  'contact-sales': 'Website Contact Sales',
  newsletter: 'Website Newsletter',
  'roi-calculator': 'Website ROI Calculator',
  'growth-assessment': 'Website Growth Assessment',
}

function scoreForSource(source) {
  if (source === 'book-demo' || source === 'contact-sales') return { score: 75, label: 'Hot' }
  if (source === 'free-trial' || source === 'growth-assessment') return { score: 60, label: 'Warm' }
  return { score: 45, label: 'Cold' }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const source = body.source || 'website'
    const { score, label } = scoreForSource(source)

    if (!body.email && !body.phone) {
      return NextResponse.json({ success: false, error: 'email or phone required' }, { status: 400 })
    }

    const db = await getDb()
    const orgId = resolveMarketingOrgId()
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
      product: body.product || '',
      message: body.message || body.challenge || '',
      source: `website-${source}`,
      status: 'NEW',
      assignedTo: 'Sales Team',
      label,
      score,
      reasons: [SOURCE_LABELS[source] || 'Website Lead'],
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
      payload: { source: lead.source, company: lead.company, product: lead.product },
      source: 'marketing-website',
    })

    try {
      const { handleWorkflowTrigger, WORKFLOW_TRIGGERS } = await import('@/lib/automation/workflow-engine')
      await handleWorkflowTrigger(db, orgId, WORKFLOW_TRIGGERS.LEAD_CREATED, { leadId: lead.id, lead })
    } catch (e) {
      console.warn('[marketing/leads] workflow trigger skipped:', e.message)
    }

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (error) {
    if (error.message === 'MARKETING_LEAD_ORG_ID_REQUIRED') {
      return NextResponse.json(
        { success: false, error: 'Marketing leads not configured for this environment' },
        { status: 503 },
      )
    }
    console.error(error)
    return NextResponse.json({ success: false, error: 'FAILED_TO_CREATE_LEAD' }, { status: 500 })
  }
}

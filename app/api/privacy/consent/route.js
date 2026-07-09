export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'
import { requireAuthenticatedTenant } from '@/lib/tenant'
import { writeAuditLog } from '@/lib/audit/service'
import { buildConsentAudit, logConsentEvent } from '@/lib/consent-audit'

export async function POST(req) {
  try {
    const { orgId, user } = await requireAuthenticatedTenant(req)
    const body = await req.json()
    const db = await getDb()

    const consent = buildConsentAudit({
      termsAccepted: body.termsAccepted !== false,
      dataProcessingAccepted: body.dataProcessingAccepted !== false,
      marketingConsent: body.marketingConsent === true,
      registrationMethod: body.registrationMethod || 'settings',
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
      userAgent: req.headers.get('user-agent') || '',
    })

    await db.collection('users').updateOne(
      { id: user.id },
      {
        $set: {
          dpdpConsent: consent,
          'preferences.notifications.marketing': consent.marketingConsent,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    await logConsentEvent(db, {
      userId: user.id,
      orgId,
      email: user.email,
      consent,
      event: body.marketingConsent === false ? 'marketing_withdrawn' : 'consent_updated',
    })

    await writeAuditLog({
      orgId,
      userId: user.id,
      action: consent.marketingConsent ? 'marketing_consent_granted' : 'marketing_consent_withdrawn',
      entity: 'consent',
      entityId: user.id,
      ip: consent.ip,
      ua: consent.userAgent,
    })

    return NextResponse.json({ success: true, consent })
  } catch (error) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

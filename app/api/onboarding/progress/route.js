export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

const ONBOARDING_ADMIN_ROLES = ['SUPER_ADMIN', 'ORG_ADMIN', 'admin', 'superadmin']

export async function POST(req) {
  try {
    const { orgId } = await guardCrmRequest(req, { roles: ONBOARDING_ADMIN_ROLES })
    const body = await req.json()
    const db = await getDb()

    await db.collection('onboarding_progress').updateOne(
      { orgId },
      {
        $set: {
          orgId,
          companyProfile: body.companyProfile || false,
          branding: body.branding || false,
          logo: body.logo || false,
          team: body.team || false,
          whatsapp: body.whatsapp || false,
          email: body.email || false,
          completedPercent: body.completedPercent || 0,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return crmError(error)
  }
}

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()

    const progress = await db.collection('onboarding_progress').findOne({ orgId })

    return NextResponse.json(
      progress || {
        completedPercent: 0,
        retailQuickSetup: false,
        leadQuickSetupRequired: false,
        leadQuickSetup: {
          companyName: false,
          demoLeadsImported: false,
          aiScoreViewed: false,
          completed: false,
        },
      },
    )
  } catch (error) {
    return crmError(error)
  }
}

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

    await db.collection('onboarding_profiles').updateOne(
      { orgId },
      {
        $set: {
          orgId,
          whatsappNumber: body.whatsappNumber,
          whatsappEnabled: true,
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

    const profile = await db.collection('onboarding_profiles').findOne({ orgId })

    return NextResponse.json({
      whatsappNumber: profile?.whatsappNumber || '',
      whatsappEnabled: profile?.whatsappEnabled || false,
    })
  } catch (error) {
    return crmError(error)
  }
}

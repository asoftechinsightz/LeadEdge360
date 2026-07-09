export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export async function POST(req) {
  try {
    const { orgId } = await guardCrmRequest(req, { roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'admin', 'superadmin'] })
    const body = await req.json()
    const db = await getDb()

    await db.collection('branding_assets').updateOne(
      { orgId },
      {
        $set: {
          orgId,
          brandName: body.brandName,
          primaryColor: body.primaryColor,
          secondaryColor: body.secondaryColor,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({ success: true, orgId })
  } catch (error) {
    return crmError(error)
  }
}

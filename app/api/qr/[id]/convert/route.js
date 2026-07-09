export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardGrowthRequest, growthError } from '@/lib/growth/api-helpers'
import { getQrCode, recordQrConversion } from '@/lib/qr/service'
import { parseRequestMetadata } from '@/lib/qr/metadata'

export async function POST(req, { params }) {
  try {
    const { orgId, user } = await guardGrowthRequest(req, { feature: 'qr_engine' })
    const db = await getDb()
    const qr = await getQrCode(db, orgId, params.id)
    const body = await req.json().catch(() => ({}))
    const metadata = { ...parseRequestMetadata(req), userId: user.id, leadId: body.leadId || '' }

    const doc = await recordQrConversion(db, qr.code, {
      conversionType: body.conversionType || 'generic',
      value: body.value ?? null,
      metadata,
      userId: user.id,
    })

    if (!doc) {
      const err = new Error('NOT_FOUND')
      throw err
    }

    const updated = await getQrCode(db, orgId, params.id)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return growthError(error)
  }
}

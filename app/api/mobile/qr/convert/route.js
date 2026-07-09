export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardGrowthRequest, growthError } from '@/lib/growth/api-helpers'
import { getQrCodeByCode, recordQrConversion } from '@/lib/qr/service'
import { parseRequestMetadata } from '@/lib/qr/metadata'

export async function POST(req) {
  try {
    const { orgId, user } = await guardGrowthRequest(req, { feature: 'qr_engine' })
    const db = await getDb()
    const body = await req.json()
    const code = String(body.code || '').trim()
    if (!code) {
      const err = new Error('VALIDATION_FAILED')
      err.detail = 'code is required'
      throw err
    }

    const doc = await getQrCodeByCode(db, code)
    if (!doc || doc.orgId !== orgId) {
      const err = new Error('NOT_FOUND')
      throw err
    }

    const metadata = { ...parseRequestMetadata(req), userId: user.id, leadId: body.leadId || '' }
    await recordQrConversion(db, code, {
      conversionType: body.conversionType || 'lead',
      value: body.value ?? null,
      metadata,
      userId: user.id,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        code: doc.code,
        stats: doc.stats,
      },
    })
  } catch (error) {
    return growthError(error)
  }
}

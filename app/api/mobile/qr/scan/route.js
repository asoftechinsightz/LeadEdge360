export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardGrowthRequest, growthError } from '@/lib/growth/api-helpers'
import { getQrCodeByCode, recordQrScan, resolveRedirectUrl } from '@/lib/qr/service'
import { parseRequestMetadata } from '@/lib/qr/metadata'

export async function POST(req) {
  try {
    const { orgId } = await guardGrowthRequest(req, { feature: 'qr_engine' })
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

    await recordQrScan(db, code, {
      ...parseRequestMetadata(req),
      leadId: body.leadId || '',
    })

    const redirectTo = await resolveRedirectUrl(db, doc.orgId, doc)

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        code: doc.code,
        type: doc.type,
        label: doc.label,
        redirectTo,
        stats: doc.stats,
      },
    })
  } catch (error) {
    return growthError(error)
  }
}

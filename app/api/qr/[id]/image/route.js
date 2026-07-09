export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { getQrCode } from '@/lib/qr/service'
import { qrImageUrl } from '@/lib/qr/generate'
import { guardGrowthRequest, growthError } from '@/lib/growth/api-helpers'

export async function GET(req, { params }) {
  try {
    const { orgId } = await guardGrowthRequest(req, { feature: 'qr_engine' })
    const db = await getDb()
    const doc = await getQrCode(db, orgId, params.id)
    const imageUrl = qrImageUrl(doc.code, 400)
    return NextResponse.redirect(imageUrl)
  } catch (error) {
    return growthError(error)
  }
}

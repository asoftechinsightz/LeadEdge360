import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import {
  getQrCodeByCode,
  recordQrClick,
  recordQrScan,
  resolveRedirectUrl,
} from '@/lib/qr/service'
import { parseRequestMetadata } from '@/lib/qr/metadata'
import { isPublicQrRateLimited } from '@/lib/qr/rate-limit'

export async function handlePublicQrGet(req, code) {
  const metadata = parseRequestMetadata(req)

  if (isPublicQrRateLimited(metadata.ip, code)) {
    return NextResponse.json(
      { success: false, code: 'RATE_LIMITED', message: 'Too many requests. Try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  const db = await getDb()
  const doc = await getQrCodeByCode(db, code)
  if (!doc) {
    return NextResponse.json({ success: false, message: 'QR code not found' }, { status: 404 })
  }

  await recordQrScan(db, code, metadata)
  const redirectTo = await resolveRedirectUrl(db, doc.orgId, doc)
  if (!redirectTo) {
    return NextResponse.json({ success: false, message: 'QR target unavailable' }, { status: 410 })
  }

  await recordQrClick(db, code, metadata)

  const { searchParams } = new URL(req.url)
  if (searchParams.get('format') === 'json') {
    return NextResponse.json({
      success: true,
      data: {
        redirectTo,
        type: doc.type,
        label: doc.label,
        code: doc.code,
        stats: doc.stats,
      },
    })
  }

  return NextResponse.redirect(redirectTo, 302)
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { handlePublicQrGet } from '@/lib/qr/public-handler'

export async function GET(req, { params }) {
  try {
    return await handlePublicQrGet(req, params.code)
  } catch (error) {
    console.error('[public-qr]', error)
    return NextResponse.json({ success: false, message: 'Failed to process QR' }, { status: 500 })
  }
}

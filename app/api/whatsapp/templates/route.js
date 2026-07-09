export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { guardWhatsAppRequest, whatsAppError } from '@/lib/whatsapp/api-helpers'
import { listWhatsAppTemplates } from '@/lib/whatsapp/templates'

export async function GET(req) {
  try {
    await guardWhatsAppRequest(req)
    const items = listWhatsAppTemplates()
    return NextResponse.json({ success: true, items })
  } catch (error) {
    return whatsAppError(error)
  }
}

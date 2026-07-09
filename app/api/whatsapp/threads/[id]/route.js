export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardWhatsAppRequest, whatsAppError } from '@/lib/whatsapp/api-helpers'
import { getThread } from '@/lib/whatsapp/service'

export async function GET(_req, { params }) {
  try {
    const { orgId } = await guardWhatsAppRequest(_req)
    const db = await getDb()
    const data = await getThread(db, orgId, params.id)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return whatsAppError(error)
  }
}

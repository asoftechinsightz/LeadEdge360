export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardWhatsAppRequest, whatsAppError } from '@/lib/whatsapp/api-helpers'
import { listThreads, sendMessage } from '@/lib/whatsapp/service'

function requestMeta(req) {
  return {
    ip: req.headers.get('x-forwarded-for') || '',
    ua: req.headers.get('user-agent') || '',
  }
}

export async function GET(req) {
  try {
    const { orgId } = await guardWhatsAppRequest(req)
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const data = await listThreads(db, orgId, {
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
    })
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return whatsAppError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId, user } = await guardWhatsAppRequest(req)
    const db = await getDb()
    const body = await req.json()
    const data = await sendMessage(db, orgId, user.id, body.threadId || '', body, requestMeta(req))
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return whatsAppError(error)
  }
}

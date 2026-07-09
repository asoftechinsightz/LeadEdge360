export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'
import { requireAuthenticatedTenant } from '@/lib/tenant'
import { writeAuditLog } from '@/lib/audit/service'

export async function POST(req) {
  try {
    const { orgId, user } = await requireAuthenticatedTenant(req)
    const db = await getDb()
    const body = await req.json().catch(() => ({}))

    const requestDoc = {
      id: randomUUID(),
      orgId,
      userId: user.id,
      email: user.email,
      reason: body.reason || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }
    await db.collection('data_deletion_requests').insertOne(requestDoc)

    await writeAuditLog({
      orgId,
      userId: user.id,
      action: 'data_deletion_requested',
      entity: 'user',
      entityId: user.id,
      detail: body.reason || '',
      ip: req.headers.get('x-forwarded-for') || '',
      ua: req.headers.get('user-agent') || '',
    })

    return NextResponse.json({ success: true, request: requestDoc })
  } catch (error) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

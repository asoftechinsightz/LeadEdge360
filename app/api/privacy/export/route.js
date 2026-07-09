export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { requireAuthenticatedTenant } from '@/lib/tenant'
import { writeAuditLog } from '@/lib/audit/service'

export async function GET(req) {
  try {
    const { orgId, user } = await requireAuthenticatedTenant(req)
    const db = await getDb()

    const [profile, leads, customers] = await Promise.all([
      db.collection('users').findOne({ id: user.id }, { projection: { _id: 0, passwordHash: 0 } }),
      db.collection('leads').find({ orgId, $or: [{ email: user.email }, { assignedTo: user.name }] }, { projection: { _id: 0 } }).limit(100).toArray(),
      db.collection('customers').find({ orgId, email: user.email }, { projection: { _id: 0 } }).limit(100).toArray(),
    ])

    const exportProfile = profile || { id: user.id, email: user.email, name: user.name, orgId: user.orgId, role: user.role }

    await writeAuditLog({
      orgId,
      userId: user.id,
      action: 'data_export',
      entity: 'user',
      entityId: user.id,
      ip: req.headers.get('x-forwarded-for') || '',
      ua: req.headers.get('user-agent') || '',
    })

    return NextResponse.json({
      success: true,
      exportedAt: new Date().toISOString(),
      data: { profile: exportProfile, leads, customers },
    })
  } catch (error) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()

    const [sent, failed] = await Promise.all([
      db.collection('email_messages').countDocuments({ orgId, status: 'SENT' }),
      db.collection('email_messages').countDocuments({ orgId, status: 'FAILED' }),
    ])

    return NextResponse.json({
      success: true,
      orgId,
      sent,
      failed,
    })
  } catch (error) {
    return crmError(error)
  }
}

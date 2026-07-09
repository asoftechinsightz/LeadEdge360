export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardExpiryRequest, retailError } from '@/lib/retail/expiry/api-helpers'
import { listAlerts, acknowledgeAlert } from '@/lib/retail/expiry/alerts'

export async function GET(req) {
  try {
    const { orgId } = await guardExpiryRequest(req)
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())
    const data = await listAlerts(db, orgId, params)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return retailError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId, user } = await guardExpiryRequest(req)
    const db = await getDb()
    const body = await req.json()
    if (body.alertId) {
      const data = await acknowledgeAlert(db, orgId, user.id, body.alertId)
      return NextResponse.json({ success: true, ...data })
    }
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'alertId required'
    throw err
  } catch (error) {
    return retailError(error)
  }
}

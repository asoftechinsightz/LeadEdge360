export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardGrowthRequest, growthError } from '@/lib/growth/api-helpers'
import {
  deleteBusinessCard,
  getBusinessCard,
  updateBusinessCard,
} from '@/lib/growth/business-card/service'

function requestMeta(req) {
  return {
    ip: req.headers.get('x-forwarded-for') || '',
    ua: req.headers.get('user-agent') || '',
  }
}

export async function GET(req, { params }) {
  try {
    const { orgId } = await guardGrowthRequest(req, { feature: 'business_card' })
    const db = await getDb()
    const data = await getBusinessCard(db, orgId, params.id)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return growthError(error)
  }
}

export async function PATCH(req, { params }) {
  try {
    const { orgId, user } = await guardGrowthRequest(req, { feature: 'business_card' })
    const db = await getDb()
    const body = await req.json()
    const data = await updateBusinessCard(db, orgId, user.id, params.id, body, requestMeta(req))
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return growthError(error)
  }
}

export async function DELETE(req, { params }) {
  try {
    const { orgId, user } = await guardGrowthRequest(req, { feature: 'business_card' })
    const db = await getDb()
    await deleteBusinessCard(db, orgId, user.id, params.id, requestMeta(req))
    return NextResponse.json({ success: true })
  } catch (error) {
    return growthError(error)
  }
}

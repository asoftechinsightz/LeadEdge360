export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardGrowthRequest, growthError } from '@/lib/growth/api-helpers'
import { deleteQrCode, getQrCode, updateQrCode } from '@/lib/qr/service'

function requestMeta(req) {
  return {
    ip: req.headers.get('x-forwarded-for') || '',
    ua: req.headers.get('user-agent') || '',
  }
}

export async function GET(req, { params }) {
  try {
    const { orgId } = await guardGrowthRequest(req, { feature: 'qr_engine' })
    const db = await getDb()
    const data = await getQrCode(db, orgId, params.id)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return growthError(error)
  }
}

export async function PATCH(req, { params }) {
  return updateQr(req, params)
}

export async function PUT(req, { params }) {
  return updateQr(req, params)
}

async function updateQr(req, params) {
  try {
    const { orgId, user } = await guardGrowthRequest(req, { feature: 'qr_engine' })
    const db = await getDb()
    const body = await req.json()
    const data = await updateQrCode(db, orgId, user.id, params.id, body, requestMeta(req))
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return growthError(error)
  }
}

export async function DELETE(req, { params }) {
  try {
    const { orgId, user } = await guardGrowthRequest(req, { feature: 'qr_engine' })
    const db = await getDb()
    await deleteQrCode(db, orgId, user.id, params.id, requestMeta(req))
    return NextResponse.json({ success: true })
  } catch (error) {
    return growthError(error)
  }
}

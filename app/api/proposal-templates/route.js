import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'

export async function GET(req) {
  const { orgId } = await guardCrmRequest(req)
  const db = await getDb()
  const templates = await db.collection('proposal_templates').find({ orgId }).toArray()
  return NextResponse.json({ success: true, templates })
}

export async function POST(req) {
  const { orgId } = await guardCrmRequest(req)
  const body = await req.json()
  const db = await getDb()
  const result = await db.collection('proposal_templates').insertOne({
    ...body,
    orgId,
    createdAt: new Date(),
  })
  return NextResponse.json({ success: true, id: result.insertedId })
}

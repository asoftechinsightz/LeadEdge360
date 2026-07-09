export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()

    const catalog = await db.collection('catalogs')
      .find({ orgId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      count: catalog.length,
      catalog,
    })
  } catch (error) {
    return crmError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId, user } = await guardCrmRequest(req)
    const db = await getDb()
    const body = await req.json()
    const now = new Date().toISOString()

    const doc = {
      id: randomUUID(),
      ...body,
      orgId,
      createdBy: user.id,
      updatedBy: user.id,
      createdAt: now,
      updatedAt: now,
    }

    await db.collection('catalogs').insertOne(doc)

    return NextResponse.json({
      success: true,
      id: doc.id,
    })
  } catch (error) {
    return crmError(error)
  }
}

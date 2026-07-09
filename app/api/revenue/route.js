export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { getRevenueRecords } from '@/lib/revenue/service'
import { guardRevenueRequest, revenueError } from '@/lib/revenue/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardRevenueRequest(req)
    const revenue = await getRevenueRecords(orgId)
    return NextResponse.json({ success: true, count: revenue.length, revenue })
  } catch (error) {
    return revenueError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId } = await guardRevenueRequest(req)
    const body = await req.json()
    const db = await getDb()
    const result = await db.collection('revenue').insertOne({ ...body, orgId, createdAt: new Date() })
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    return revenueError(error)
  }
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

const ONBOARDING_ADMIN_ROLES = ['SUPER_ADMIN', 'ORG_ADMIN', 'admin', 'superadmin']

export async function POST(req) {
  try {
    const { orgId } = await guardCrmRequest(req, { roles: ONBOARDING_ADMIN_ROLES })
    const body = await req.json()
    const db = await getDb()

    await db.collection('team_members').insertOne({
      orgId,
      name: body.name,
      email: body.email,
      role: body.role,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return crmError(error)
  }
}

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()

    const members = await db.collection('team_members').find({ orgId }).toArray()

    return NextResponse.json({
      success: true,
      count: members.length,
      members,
    })
  } catch (error) {
    return crmError(error)
  }
}

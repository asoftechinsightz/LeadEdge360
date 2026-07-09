export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { activateWorkflow } from '@/lib/automation/workflow-engine'

export async function POST(req, { params }) {
  try {
    const { orgId, user } = await guardCrmRequest(req)
    const db = await getDb()
    const workflow = await activateWorkflow(db, orgId, params.id, user.id)
    return NextResponse.json({ success: true, workflow })
  } catch (error) {
    return crmError(error)
  }
}

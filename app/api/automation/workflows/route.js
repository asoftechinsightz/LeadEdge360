export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { listWorkflows, createWorkflow } from '@/lib/automation/workflow-engine'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()
    const items = await listWorkflows(db, orgId)
    return NextResponse.json({ success: true, items })
  } catch (error) {
    return crmError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId, user } = await guardCrmRequest(req)
    const body = await req.json()
    const db = await getDb()
    const workflow = await createWorkflow(db, orgId, {
      name: body.name,
      trigger: body.trigger,
      steps: body.steps,
      status: 'draft',
      createdBy: user.id,
    })
    return NextResponse.json({ success: true, workflow }, { status: 201 })
  } catch (error) {
    return crmError(error)
  }
}

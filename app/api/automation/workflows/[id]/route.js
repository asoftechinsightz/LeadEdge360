export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { getWorkflow, updateWorkflow } from '@/lib/automation/workflow-engine'

export async function GET(req, { params }) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()
    const workflow = await getWorkflow(db, orgId, params.id)
    if (!workflow) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Workflow not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, workflow })
  } catch (error) {
    return crmError(error)
  }
}

export async function PATCH(req, { params }) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const body = await req.json()
    const db = await getDb()
    const workflow = await updateWorkflow(db, orgId, params.id, body)
    return NextResponse.json({ success: true, workflow })
  } catch (error) {
    return crmError(error)
  }
}

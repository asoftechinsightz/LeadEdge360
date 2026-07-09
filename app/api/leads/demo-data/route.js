export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { seedOrgDemoData, clearOrgDemoData } from '@/lib/onboarding/demo-seed'

export async function POST(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()

    const profile = await db.collection('onboarding_profiles').findOne({ orgId })
    const org = await db.collection('orgs').findOne({ id: orgId })
    const industry = profile?.industry || org?.industry || 'general'

    const result = await seedOrgDemoData(db, orgId, {
      industry,
      companyName: profile?.companyName || org?.name,
    })

    const count = result.leadsCreated ?? result.leads ?? 0

    return NextResponse.json({
      success: true,
      skipped: result.skipped === true,
      leadsCreated: count,
      pipeline: result.pipeline ?? 0,
      proposal: result.proposal ?? 0,
      message: result.skipped
        ? `Workspace already has ${count} leads`
        : `Added ${count} demo leads, ${result.pipeline || 0} opportunity, ${result.proposal || 0} proposal`,
    })
  } catch (error) {
    return crmError(error)
  }
}

export async function DELETE(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()
    const result = await clearOrgDemoData(db, orgId)

    return NextResponse.json({
      success: true,
      ...result,
      message: result.cleared
        ? `Removed ${result.leadsRemoved} demo leads`
        : 'No demo data to clear',
    })
  } catch (error) {
    return crmError(error)
  }
}

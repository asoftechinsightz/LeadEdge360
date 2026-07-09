import { NextResponse } from 'next/server'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { requirePlan } from '@/lib/billing/require-plan'
import { listProposals, createProposal } from '@/lib/proposals/service'

const PROPOSAL_PLANS = ['GROWTH', 'PRO', 'BUSINESS_GROWTH', 'ENTERPRISE']

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    await requirePlan(orgId, PROPOSAL_PLANS)
    const proposals = await listProposals(orgId)
    return NextResponse.json({ success: true, count: proposals.length, proposals })
  } catch (error) {
    return crmError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    await requirePlan(orgId, PROPOSAL_PLANS)
    const body = await req.json()
    const proposal = await createProposal({ ...body, orgId })
    return NextResponse.json({ success: true, proposal })
  } catch (error) {
    return crmError(error)
  }
}

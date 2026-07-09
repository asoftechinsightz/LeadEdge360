import { NextResponse } from 'next/server'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { queueHotLeadsWorkflow } from '@/lib/sales/bulk-hot-workflow'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const tenant = await guardCrmRequest(request)
    const body = await request.json().catch(() => ({}))
    const assignedBy = tenant.user?.fullName || tenant.user?.name || tenant.user?.email || 'Admin'

    const result = await queueHotLeadsWorkflow(tenant.orgId, {
      assignedTo: body.assignedTo || '',
      minScore: body.minScore ?? 80,
      limit: body.limit ?? 50,
      dryRun: body.dryRun === true,
      assignedBy,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return crmError(error)
  }
}

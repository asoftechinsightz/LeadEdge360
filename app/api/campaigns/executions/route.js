import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { listExecutions } from '@/lib/campaigns/executions'

export async function GET(request) {

  const { orgId } = await guardCrmRequest(request)

  const data =
    await listExecutions(
      orgId
    )

  return NextResponse.json(data)
}

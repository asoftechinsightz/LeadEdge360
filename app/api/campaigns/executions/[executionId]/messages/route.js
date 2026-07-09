import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

import {
  listExecutionMessages
} from '@/lib/campaigns/executions'

export async function GET(
  request,
  { params }
) {

  const { orgId } = await guardCrmRequest(request)

  const data =
    await listExecutionMessages(
      orgId,
      params.executionId
    )

  return NextResponse.json(data)
}

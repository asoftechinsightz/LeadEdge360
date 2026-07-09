import { NextResponse } from 'next/server'
import { getEmailTemplateSummary }
from '@/lib/templates/summary'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export const dynamic = 'force-dynamic'

export async function GET(request) {

  try {

    const { orgId } = await guardCrmRequest(request)

    const data =
      await getEmailTemplateSummary(
        orgId
      )

    return NextResponse.json(data)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        success:false,
        error:'Failed to load summary'
      },
      {
        status:500
      }
    )
  }
}

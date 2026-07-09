import { NextResponse } from 'next/server'
import { getCampaignSummary } from '@/lib/campaigns/summary'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export const dynamic = 'force-dynamic'

export async function GET(request) {

  try {

    const { orgId } = await guardCrmRequest(request)

    const data =
      await getCampaignSummary(
        orgId
      )

    return NextResponse.json(data)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        success:false,
        error:'Failed to load campaign summary'
      },
      {
        status:500
      }
    )
  }
}

import { NextResponse } from 'next/server'
import { getCampaignAnalytics } from '@/lib/campaigns/analytics'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export const dynamic = 'force-dynamic'

export async function GET(request) {

  try {

    const { orgId } = await guardCrmRequest(request)

    const data =
      await getCampaignAnalytics(
        orgId
      )

    return NextResponse.json(data)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        success:false,
        error:'Failed to load analytics'
      },
      {
        status:500
      }
    )
  }
}

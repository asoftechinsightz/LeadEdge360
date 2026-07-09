import { NextResponse } from 'next/server'
import { getCampaignDetailAnalytics } from '@/lib/campaigns/analytics'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export async function GET(
  request,
  { params }
) {

  try {

    const { orgId } = await guardCrmRequest(request)

    const data =
      await getCampaignDetailAnalytics(
        orgId,
        params.id
      )

    if (!data) {

      return NextResponse.json(
        {
          success:false,
          error:'Campaign not found'
        },
        {
          status:404
        }
      )
    }

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

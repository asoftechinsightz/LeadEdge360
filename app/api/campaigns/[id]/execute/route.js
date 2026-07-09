import { NextResponse } from 'next/server'
import { executeCampaign } from '@/lib/campaigns/execute'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export async function POST(
  request,
  { params }
) {

  try {

    const { orgId } = await guardCrmRequest(request)

    const data =
      await executeCampaign(
        orgId,
        params.id
      )

    return NextResponse.json(data)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        success:false,
        error:error.message
      },
      {
        status:500
      }
    )
  }
}

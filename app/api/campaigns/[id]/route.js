import { NextResponse } from 'next/server'

import {
  getCampaign,
  updateCampaign,
  deleteCampaign
} from '@/lib/campaigns/campaigns'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export async function GET(
  request,
  { params }
) {

  try {

    const { orgId } = await guardCrmRequest(request)

    const data =
      await getCampaign(
        orgId,
        params.id
      )

    return NextResponse.json(data)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        success:false,
        error:'Failed to load campaign'
      },
      {
        status:500
      }
    )
  }
}

export async function PUT(
  request,
  { params }
) {
  return PATCH(request, { params })
}

export async function PATCH(
  request,
  { params }
) {

  try {

    const { orgId } = await guardCrmRequest(request)

    const body =
      await request.json()

    const data =
      await updateCampaign(
        orgId,
        params.id,
        body
      )

    return NextResponse.json(data)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        success:false,
        error:'Failed to update campaign'
      },
      {
        status:500
      }
    )
  }
}

export async function DELETE(
  request,
  { params }
) {

  try {

    const { orgId } = await guardCrmRequest(request)

    const data =
      await deleteCampaign(
        orgId,
        params.id
      )

    return NextResponse.json(data)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        success:false,
        error:'Failed to delete campaign'
      },
      {
        status:500
      }
    )
  }
}

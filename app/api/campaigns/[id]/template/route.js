import { NextResponse } from 'next/server'

import {
  attachTemplate
} from '@/lib/campaigns/campaigns'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export async function PUT(
  request,
  { params }
) {

  try {

    const { orgId } = await guardCrmRequest(request)

    const body =
      await request.json()

    const data =
      await attachTemplate(
        orgId,
        params.id,
        body.templateId
      )

    return NextResponse.json(data)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        success:false,
        error:'Failed to attach template'
      },
      {
        status:500
      }
    )
  }
}

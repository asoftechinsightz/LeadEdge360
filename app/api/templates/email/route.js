import { NextResponse } from 'next/server'

import {
  createEmailTemplate,
  listEmailTemplates
} from '@/lib/templates/email'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export async function GET(request) {

  try {

    const { orgId } = await guardCrmRequest(request)

    const { searchParams } =
      new URL(request.url)

    const data =
      await listEmailTemplates(
        orgId,
        searchParams.get('page'),
        searchParams.get('limit')
      )

    return NextResponse.json(data)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        success:false,
        error:'Failed to load templates'
      },
      {
        status:500
      }
    )
  }
}

export async function POST(request) {

  try {

    const { orgId } = await guardCrmRequest(request)

    const body =
      await request.json()

    const data =
      await createEmailTemplate(
        orgId,
        body
      )

    return NextResponse.json(data)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        success:false,
        error:'Failed to create template'
      },
      {
        status:500
      }
    )
  }
}

import { NextResponse } from 'next/server'

import {
  getEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate
} from '@/lib/templates/email'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export async function GET(
  request,
  { params }
) {

  const { orgId } = await guardCrmRequest(request)

  const data =
    await getEmailTemplate(
      orgId,
      params.id
    )

  return NextResponse.json(data)
}

export async function PUT(
  request,
  { params }
) {

  const { orgId } = await guardCrmRequest(request)

  const body =
    await request.json()

  const data =
    await updateEmailTemplate(
      orgId,
      params.id,
      body
    )

  return NextResponse.json(data)
}

export async function DELETE(
  request,
  { params }
) {

  const { orgId } = await guardCrmRequest(request)

  const data =
    await deleteEmailTemplate(
      orgId,
      params.id
    )

  return NextResponse.json(data)
}

import { NextResponse } from 'next/server'
import { getSalesWorkload } from '@/lib/sales/workload'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export const dynamic = 'force-dynamic'

export async function GET(request) {

  try {

    const { orgId } = await guardCrmRequest(request)

    const data =
      await getSalesWorkload(
        orgId
      )

    return NextResponse.json(data)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        success:false,
        error:'Failed to load workload'
      },
      {
        status:500
      }
    )
  }
}

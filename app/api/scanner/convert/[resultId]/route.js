import { NextResponse } from 'next/server'
import { convertScannerResult } from '@/lib/scanner/convert'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export async function POST(
  request,
  { params }
) {

  try {

    const { orgId } = await guardCrmRequest(request)

    const data =
      await convertScannerResult(
        orgId,
        params.resultId
      )

    return NextResponse.json(data)

  } catch (error) {

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

import { NextResponse } from 'next/server'
import { listScannerResultsByJob } from '@/lib/scanner/results'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export async function GET(request, { params }) {
  try {
    const { orgId } = await guardCrmRequest(request)

    const { searchParams } = new URL(request.url)

    const data = await listScannerResultsByJob(
      orgId,
      params.jobId,
      {
        page: searchParams.get('page'),
        limit: searchParams.get('limit')
      }
    )

    return NextResponse.json(data)

  } catch (error) {
    console.error('scanner job results error', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load scanner job results'
      },
      {
        status: 500
      }
    )
  }
}

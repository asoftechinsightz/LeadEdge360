import { NextResponse } from 'next/server'
import { listScannerResults } from '@/lib/scanner/results'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { orgId } = await guardCrmRequest(request)

    const { searchParams } = new URL(request.url)

    const data = await listScannerResults(
      orgId,
      {
        page: searchParams.get('page'),
        limit: searchParams.get('limit')
      }
    )

    return NextResponse.json(data)

  } catch (error) {
    console.error('scanner results error', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load scanner results'
      },
      {
        status: 500
      }
    )
  }
}

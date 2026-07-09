import { NextResponse } from 'next/server'
import { getScannerJob } from '@/lib/scanner/job-details'
import { runScannerJob } from '@/lib/scanner/runner'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'

export async function GET(request, { params }) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const data = await getScannerJob(orgId, params.jobId)
    if (!data) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (error) {
    return crmError(error)
  }
}

export async function POST(request, { params }) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const job = await runScannerJob(params.jobId)
    return NextResponse.json({ success: true, status: 'COMPLETED', jobId: job?.id || params.jobId })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

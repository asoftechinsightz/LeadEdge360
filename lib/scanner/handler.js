import { createScannerJob, listScannerJobs } from '@/lib/scanner/jobs'
import { runScannerJob } from '@/lib/scanner/runner'

export async function handleScanner({
  method,
  id,
  request,
  orgId,
  user
}) {

  if (method === 'GET' && !id) {
    const jobs = await listScannerJobs(orgId)

    return {
      success: true,
      jobs
    }
  }

  if (method === 'POST' && !id) {

    const body = await request.json()

    const job = await createScannerJob({
      orgId,
      industry: body.industry,
      state: body.state,
      city: body.city,
      radiusKm: Number(body.radiusKm || 25),
      createdBy: user?.email || 'system'
    })

    return {
      success: true,
      job
    }
  }

  if (method === 'POST' && id) {

    const job = await runScannerJob(id)

    return {
      success: true,
      status: 'RUNNING',
      jobId: job.id
    }
  }

  return null
}

import { getScannerCollections } from '@/lib/scanner/db'

export async function getScannerJob(orgId, jobId) {

  const { jobs, results } =
    await getScannerCollections()

  const job =
    await jobs.findOne(
      {
        orgId,
        id: jobId
      },
      {
        projection: {
          _id: 0
        }
      }
    )

  if (!job) {
    return null
  }

  const resultsCount =
    await results.countDocuments({
      orgId,
      jobId
    })

  return {
    success: true,
    job,
    resultsCount
  }
}

import { getScannerCollections } from '@/lib/scanner/db'

export async function getScannerSummary(orgId) {

  const { jobs, results } =
    await getScannerCollections()

  const [
    totalJobs,
    completedJobs,
    runningJobs,
    failedJobs,
    totalResults
  ] = await Promise.all([
    jobs.countDocuments({ orgId }),
    jobs.countDocuments({ orgId, status: 'COMPLETED' }),
    jobs.countDocuments({ orgId, status: 'RUNNING' }),
    jobs.countDocuments({ orgId, status: 'FAILED' }),
    results.countDocuments({ orgId })
  ])

  const ratingData =
    await results.aggregate([
      {
        $match: {
          orgId,
          rating: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: {
            $avg: '$rating'
          }
        }
      }
    ]).toArray()

  return {
    success: true,
    totalJobs,
    completedJobs,
    runningJobs,
    failedJobs,
    totalResults,
    avgRating:
      ratingData[0]?.avgRating || 0
  }
}

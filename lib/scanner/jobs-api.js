import { getScannerCollections } from '@/lib/scanner/db'

export async function listScannerJobs(
  orgId,
  page = 1,
  limit = 20
) {

  const { jobs } =
    await getScannerCollections()

  page = Math.max(
    parseInt(page || 1, 10),
    1
  )

  limit = Math.min(
    Math.max(parseInt(limit || 20, 10), 1),
    100
  )

  const skip =
    (page - 1) * limit

  const filter = { orgId }

  const [items, total] =
    await Promise.all([

      jobs.find(
        filter,
        {
          projection: {
            _id: 0
          }
        }
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),

      jobs.countDocuments(filter)
    ])

  return {
    success: true,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    items
  }
}

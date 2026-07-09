import { getDb } from '@/lib/mongo'
import { applyActiveLeadFilter, normalizeLeadDoc } from '@/lib/leads/service'

const PRIORITY_SORT = {
  Platinum: 1,
  Hot: 2,
  Warm: 3,
  Cold: 4
}

export async function listSalesLeads(
  orgId,
  query = {}
) {

  const db = await getDb()

  const page = Math.max(
    parseInt(query.page || 1, 10),
    1
  )

  const limit = Math.min(
    Math.max(
      parseInt(query.limit || 20, 10),
      1
    ),
    100
  )

  const skip =
    (page - 1) * limit

  const filter = applyActiveLeadFilter({ orgId })

  if (query.status) {
    filter.status = query.status
  }

  if (query.label) {
    filter.label = query.label
  }

  if (query.q) {
    const escaped = String(query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const rx = new RegExp(escaped, 'i')
    filter.$or = [
      { name: rx },
      { company: rx },
      { email: rx },
      { phone: rx },
    ]
  }

  const [items, total] =
    await Promise.all([

      db.collection('leads')
        .find(
          filter,
          {
            projection: {
              _id: 0
            }
          }
        )
        .sort({
          score: -1,
          createdAt: -1
        })
        .skip(skip)
        .limit(limit)
        .toArray(),

      db.collection('leads')
        .countDocuments(filter)

    ])

  return {
    success: true,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    items: items.map((row) => normalizeLeadDoc(row)).filter(Boolean),
  }
}

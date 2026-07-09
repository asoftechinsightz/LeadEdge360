import { getDb } from '@/lib/mongo'

export async function getCampaignSummary(
  orgId
) {

  const db =
    await getDb()

  const campaigns =
    db.collection('campaigns')

  const [
    draft,
    scheduled,
    running,
    completed,
    failed,
    cancelled
  ] = await Promise.all([

    campaigns.countDocuments({
      orgId,
      status:'draft'
    }),

    campaigns.countDocuments({
      orgId,
      status:'scheduled'
    }),

    campaigns.countDocuments({
      orgId,
      status:'running'
    }),

    campaigns.countDocuments({
      orgId,
      status:'completed'
    }),

    campaigns.countDocuments({
      orgId,
      status:'failed'
    }),

    campaigns.countDocuments({
      orgId,
      status:'cancelled'
    })

  ])

  return {
    success:true,
    draft,
    scheduled,
    running,
    completed,
    failed,
    cancelled
  }
}

import { getDb } from '@/lib/mongo'

export async function getCampaignAnalytics(
  orgId
) {

  const db = await getDb()

  const [
    totalCampaigns,
    totalExecutions,
    totalMessages
  ] = await Promise.all([

    db.collection('campaigns')
      .countDocuments({ orgId }),

    db.collection('campaign_executions')
      .countDocuments({ orgId }),

    db.collection('campaign_messages')
      .countDocuments({ orgId })

  ])

  const campaigns =
    await db.collection('campaigns')
      .find(
        { orgId },
        {
          projection: {
            _id: 0
          }
        }
      )
      .toArray()

  const executions =
    await db.collection('campaign_executions')
      .find(
        { orgId },
        {
          projection: {
            _id: 0
          }
        }
      )
      .toArray()

  const totalLeadsTargeted =
    executions.reduce((sum, ex) => sum + (ex.totalLeads || 0), 0) ||
    campaigns.reduce(
      (sum, campaign) => sum + (campaign.audience?.leadIds?.length || 0),
      0
    )

  const averageCampaignSize =
    totalCampaigns
      ? Number(
          (
            totalLeadsTargeted /
            totalCampaigns
          ).toFixed(2)
        )
      : 0

  const completedExecutions =
    executions.filter(
      x => x.status === 'completed'
    ).length

  const executionSuccessRate =
    totalExecutions
      ? Number(
          (
            completedExecutions *
            100
          ) /
          totalExecutions
        ).toFixed(2)
      : 0

  const lastExecutedAt =
    executions.length
      ? executions
          .sort(
            (a,b) =>
              new Date(
                b.createdAt
              ) -
              new Date(
                a.createdAt
              )
          )[0]
          ?.createdAt
      : null

  const performanceSummary =
    campaigns.map(c => ({
      id: c.id,
      name: c.name,
      status: c.status,
      channel: c.channel
    }))

  return {
    success: true,
    totalCampaigns,
    totalExecutions,
    totalMessages,
    totalLeadsTargeted,
    averageCampaignSize,
    executionSuccessRate,
    lastExecutedAt,
    performanceSummary
  }
}

export async function getCampaignDetailAnalytics(
  orgId,
  campaignId
) {

  const db = await getDb()

  const campaign =
    await db.collection('campaigns')
      .findOne({
        orgId,
        id: campaignId
      })

  if (!campaign) {
    return null
  }

  const executions =
    await db.collection(
      'campaign_executions'
    )
    .find({
      orgId,
      campaignId
    })
    .toArray()

  const executionIds =
    executions.map(
      x => x.id
    )

  const totalMessages =
    executionIds.length
      ? await db.collection(
          'campaign_messages'
        )
        .countDocuments({
          orgId,
          executionId: {
            $in: executionIds
          }
        })
      : 0

  const completedExecutions =
    executions.filter(
      x => x.status === 'completed'
    ).length

  return {
    success: true,
    campaignId,
    campaignName:
      campaign.name,
    totalExecutions:
      executions.length,
    totalMessages,
    totalLeadsTargeted:
      executions.reduce((sum, ex) => sum + (ex.totalLeads || 0), 0) ||
      campaign.audience?.leadIds?.length ||
      0,
    executionSuccessRate:
      executions.length
        ? Number(
            (
              completedExecutions *
              100
            ) /
            executions.length
          ).toFixed(2)
        : 0,
    lastExecutedAt:
      executions.length
        ? executions.sort(
            (a,b)=>
              new Date(
                b.createdAt
              ) -
              new Date(
                a.createdAt
              )
          )[0]?.createdAt
        : null
  }
}

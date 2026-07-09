import { getDb } from '@/lib/mongo'

export async function getSalesQueue(orgId) {

  const db = await getDb()

  const [
    newLeads,
    platinumLeads,
    hotLeads,
    warmLeads,
    coldLeads,
    pendingFollowups,
    openTasks
  ] = await Promise.all([

    db.collection('leads')
      .countDocuments({
        orgId,
        status: 'New'
      }),

    db.collection('leads')
      .countDocuments({
        orgId,
        label: 'Platinum'
      }),

    db.collection('leads')
      .countDocuments({
        orgId,
        label: 'Hot'
      }),

    db.collection('leads')
      .countDocuments({
        orgId,
        label: 'Warm'
      }),

    db.collection('leads')
      .countDocuments({
        orgId,
        label: 'Cold'
      }),

    db.collection('follow_ups')
      .countDocuments({
        orgId,
        status: 'pending'
      }),

    db.collection('lead_tasks')
      .countDocuments({
        orgId,
        status: 'open'
      })

  ])

  return {
    success: true,
    newLeads,
    platinumLeads,
    hotLeads,
    warmLeads,
    coldLeads,
    pendingFollowups,
    openTasks
  }
}

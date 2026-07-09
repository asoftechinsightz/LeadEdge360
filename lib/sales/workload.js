import { getDb } from '@/lib/mongo'

export async function getSalesWorkload(
  orgId
) {

  const db =
    await getDb()

  const leads =
    await db.collection('leads')
      .find(
        {
          orgId,
          assignedTo: {
            $exists: true,
            $ne: ''
          }
        },
        {
          projection: {
            _id: 0,
            assignedTo: 1
          }
        }
      )
      .toArray()

  const workloadMap = {}

  for (const lead of leads) {

    const owner =
      lead.assignedTo

    if (!workloadMap[owner]) {

      workloadMap[owner] = {
        assignedTo: owner,
        assignedLeads: 0,
        pendingFollowups: 0,
        openTasks: 0
      }
    }

    workloadMap[owner]
      .assignedLeads++
  }

  for (const owner of Object.keys(workloadMap)) {

    workloadMap[owner]
      .pendingFollowups =
        await db.collection('follow_ups')
          .countDocuments({
            orgId,
            status: 'pending'
          })

    workloadMap[owner]
      .openTasks =
        await db.collection('lead_tasks')
          .countDocuments({
            orgId,
            status: 'open'
          })
  }

  return {
    success: true,
    items:
      Object.values(
        workloadMap
      )
  }
}

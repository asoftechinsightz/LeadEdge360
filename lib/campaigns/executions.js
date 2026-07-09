import { getDb } from '@/lib/mongo'

export async function listExecutions(
  orgId
) {

  const db = await getDb()

  const items =
    await db.collection(
      'campaign_executions'
    )
    .find(
      { orgId },
      {
        projection: {
          _id: 0
        }
      }
    )
    .sort({
      createdAt: -1
    })
    .toArray()

  return {
    success: true,
    items
  }
}

export async function listExecutionMessages(
  orgId,
  executionId
) {

  const db = await getDb()

  const items =
    await db.collection(
      'campaign_messages'
    )
    .find(
      {
        orgId,
        executionId
      },
      {
        projection: {
          _id: 0
        }
      }
    )
    .limit(100)
    .toArray()

  return {
    success: true,
    executionId,
    items
  }
}

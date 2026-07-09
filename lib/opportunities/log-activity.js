import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'

export async function logActivity(
  opportunityId,
  title,
  notes=''
){

  const db = await getDb()

  await db.collection(
    'opportunity_activities'
  ).insertOne({
    id: randomUUID(),
    opportunityId,
    title,
    notes,
    createdAt:
      new Date().toISOString()
  })

}

import { getDb } from '@/lib/mongo'
import { createOpportunity } from './create-opportunity'

export async function autoCreateOpportunities(){

  const db = await getDb()

  const leads =
    await db.collection('leads')
      .find({
        source:'AI_SCANNER'
      })
      .toArray()

  let created = 0

  for(const lead of leads){

    const existing =
      await db.collection('opportunities')
      .findOne({
        leadId:lead.id
      })

    if(existing){
      continue
    }

    await createOpportunity({
      orgId:lead.orgId,
      leadId:lead.id,
      company:lead.name,
      owner:lead.assignedTo
    })

    created++
  }

  return {created}
}

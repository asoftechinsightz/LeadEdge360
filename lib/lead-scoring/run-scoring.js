import { getDb } from '@/lib/mongo'
import { calculateLeadScore } from './engine'

export async function runLeadScoring({ orgId = null } = {}) {

  const db = await getDb()

  const scannerResults =
    db.collection('scanner_results')

  const leadScores =
    db.collection('lead_scores')

  const query = orgId ? { orgId } : {}
  const leads =
    await scannerResults.find(query).toArray()

  let processed = 0

  for (const lead of leads) {

    const result =
      calculateLeadScore(lead)

    await leadScores.updateOne(
      {
        orgId: lead.orgId,
        leadId: lead.id || lead.placeId
      },
      {
        $set: {
          orgId: lead.orgId,
          leadId:
            lead.id ||
            lead.placeId,
          company: lead.company,
          city: lead.city,
          state: lead.state,
          score: result.score,
          classification:
            result.classification,
          reasons: result.reasons,
          updatedAt: new Date()
        }
      },
      {
        upsert: true
      }
    )

    processed++
  }

  return {
    processed
  }
}

import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'

export async function convertHotLeads() {

  const db = await getDb()

  const scores =
    db.collection('lead_scores')

  const scanner =
    db.collection('scanner_results')

  const leads =
    db.collection('leads')

  const timeline =
    db.collection('lead_timeline')

  const followups =
    db.collection('follow_ups')

  const assignments =
    db.collection('lead_assignments')

  const hotLeads =
    await scores.find({
      classification: 'HOT'
    }).toArray()

  let created = 0
  let skipped = 0

  for (const score of hotLeads) {

    const sourceLead =
      await scanner.findOne({
        company: score.company
      })

    if (!sourceLead) {
      skipped++
      continue
    }

    const duplicate =
      await leads.findOne({
        orgId: score.orgId,
        $or: [
          { phone: sourceLead.phone },
          { website: sourceLead.website },
          { company: sourceLead.company }
        ]
      })

    if (duplicate) {
      skipped++
      continue
    }

    const leadId = randomUUID()

    await leads.insertOne({
      id: leadId,
      orgId: score.orgId,
      name: sourceLead.company,
      phone: sourceLead.phone || '',
      email: '',
      source: 'AI_SCANNER',
      status: 'New',
      assignedTo: 'Sales Team',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    await timeline.insertOne({
      id: randomUUID(),
      orgId: score.orgId,
      leadId,
      type: 'system',
      title: 'Auto Lead Created',
      description:
        `HOT Lead Auto Converted Score=${score.score}`,
      createdAt: new Date().toISOString()
    })

    const tomorrow =
      new Date(
        Date.now() +
        24*60*60*1000
      )

    await followups.insertOne({
      id: randomUUID(),
      orgId: score.orgId,
      leadId,
      title: 'HOT Lead Follow-up',
      dueAt: tomorrow.toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    })

    await assignments.updateOne({ orgId: score.orgId, leadId, assignedTo: 'Sales Team' }, { $setOnInsert: { id: randomUUID(), orgId: score.orgId, leadId, assignedTo: 'Sales Team', createdAt: new Date().toISOString() } }, { upsert: true })

    created++
  }

  return {
    created,
    skipped
  }
}

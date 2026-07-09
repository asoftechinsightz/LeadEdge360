import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'
import { applyActiveLeadFilter } from '@/lib/leads/service'
import { emitPlatformEvent } from '@/lib/events/bus'
import { PLATFORM_EVENTS } from '@/lib/events/types'

const SALES_AGENTS = [
  { id: 'a4', name: 'Neha Kapoor', territory: 'Delhi NCR' },
  { id: 'a1', name: 'Aarav Sharma', territory: 'Bengaluru' },
  { id: 'a2', name: 'Priya Iyer', territory: 'Bengaluru' },
  { id: 'a3', name: 'Rohan Mehta', territory: 'Mumbai' },
  { id: 'a5', name: 'Vikram Singh', territory: 'Hyderabad' },
  { id: 'a6', name: 'Anjali Reddy', territory: 'Chennai' },
  { id: 'a7', name: 'Karthik Nair', territory: 'Pune' },
]

const NCR_CITIES = /ghaziabad|noida|greater noida|delhi|gurgaon|gurugram|faridabad/i

function resolveAssignee(lead, explicit) {
  if (explicit) return explicit
  const territory = String(lead.territory || lead.city || '').trim()
  if (NCR_CITIES.test(territory)) {
    return SALES_AGENTS.find((a) => a.territory === 'Delhi NCR')?.name || 'Sales Team'
  }
  const hit = SALES_AGENTS.find((a) => a.territory === territory)
  if (hit) return hit.name
  return 'Sales Team'
}

function agentIdForName(name) {
  return SALES_AGENTS.find((a) => a.name === name)?.id || null
}

/**
 * Assign unassigned Hot leads, create follow-up + call task (idempotent).
 */
export async function queueHotLeadsWorkflow(orgId, {
  assignedTo = '',
  minScore = 80,
  limit = 50,
  dryRun = false,
  assignedBy = 'System',
} = {}) {
  const db = await getDb()

  const filter = applyActiveLeadFilter({
    orgId,
    status: 'New',
    $and: [
      {
        $or: [
          { label: 'Hot' },
          { score: { $gte: minScore } },
        ],
      },
      {
        $or: [
          { assignedTo: { $exists: false } },
          { assignedTo: '' },
          { assignedTo: null },
        ],
      },
    ],
  })

  const leads = await db.collection('leads')
    .find(filter, { projection: { _id: 0 } })
    .sort({ score: -1, createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 200))
    .toArray()

  const stats = {
    matched: leads.length,
    assigned: 0,
    followupsCreated: 0,
    tasksCreated: 0,
    skipped: 0,
    dryRun,
    items: [],
  }

  if (dryRun) {
    stats.items = leads.map((l) => ({
      leadId: l.id,
      company: l.company || l.name,
      score: l.score,
      wouldAssignTo: resolveAssignee(l, assignedTo),
    }))
    return stats
  }

  const now = new Date()
  const dueAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()

  for (const lead of leads) {
    const owner = resolveAssignee(lead, assignedTo)
    const agentId = agentIdForName(owner)

    const existingFollowup = await db.collection('follow_ups').findOne({
      orgId,
      leadId: lead.id,
      status: 'pending',
    })

    if (lead.assignedTo && existingFollowup) {
      stats.skipped++
      continue
    }

    if (!lead.assignedTo) {
      await db.collection('leads').updateOne(
        { orgId, id: lead.id },
        {
          $set: {
            assignedTo: owner,
            assignedAgentId: agentId,
            updatedAt: now.toISOString(),
          },
        },
      )

      await db.collection('lead_assignments').insertOne({
        id: randomUUID(),
        orgId,
        leadId: lead.id,
        assignedTo: owner,
        assignedBy,
        assignedAgentId: agentId,
        createdAt: now.toISOString(),
      })

      await db.collection('lead_timeline').insertOne({
        id: randomUUID(),
        orgId,
        leadId: lead.id,
        type: 'assigned',
        title: 'Hot lead queued',
        payload: { to: owner, source: 'bulk-hot-workflow' },
        createdAt: now.toISOString(),
      })

      await emitPlatformEvent({
        db,
        orgId,
        type: PLATFORM_EVENTS.LEAD_ASSIGNED,
        entity: 'lead',
        entityId: lead.id,
        payload: { to: owner, source: 'bulk-hot-workflow' },
        source: 'bulk-hot-workflow',
      })

      stats.assigned++
    }

    if (!existingFollowup) {
      await db.collection('follow_ups').insertOne({
        id: randomUUID(),
        orgId,
        leadId: lead.id,
        title: 'Initial Call — Hot Lead',
        notes: 'Call within 24h. Introduce LeadEdge360 CRM + Geo Lead Finder demo.',
        channel: lead.phone ? 'whatsapp' : 'call',
        dueAt,
        status: 'pending',
        createdAt: now.toISOString(),
        metadata: { source: 'bulk-hot-workflow', minScore },
      })
      stats.followupsCreated++
    }

    const existingTask = await db.collection('lead_tasks').findOne({
      orgId,
      leadId: lead.id,
      status: 'open',
    })

    if (!existingTask) {
      await db.collection('lead_tasks').insertOne({
        id: randomUUID(),
        orgId,
        leadId: lead.id,
        title: 'Call Hot Lead',
        description: `Outbound to ${lead.company || lead.name || 'lead'} — score ${lead.score ?? '—'}`,
        priority: 'high',
        status: 'open',
        dueAt,
        createdAt: now.toISOString(),
      })
      stats.tasksCreated++
    }

    stats.items.push({
      leadId: lead.id,
      company: lead.company || lead.name,
      assignedTo: owner,
      score: lead.score,
    })
  }

  return stats
}

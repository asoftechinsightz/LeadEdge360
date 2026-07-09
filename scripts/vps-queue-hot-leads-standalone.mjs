#!/usr/bin/env node
/**
 * Standalone Hot-lead queue — runs on VPS without full app deploy.
 * Usage:
 *   node scripts/vps-queue-hot-leads-standalone.mjs --dry-run
 *   node scripts/vps-queue-hot-leads-standalone.mjs
 *
 * After full deploy, prefer: npm run sales:queue-hot-leads
 */
import { randomUUID } from 'crypto'
import { MongoClient } from 'mongodb'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'

loadEnvForScripts()

const dryRun = process.argv.includes('--dry-run')
const orgId = process.env.GROWTH_AUDIT_ORG_ID || process.env.PILOT_ORG_ID || 'asoftechinsightz'
const minScore = 80
const limit = 100

const NCR = /ghaziabad|noida|greater noida|delhi|gurgaon|gurugram|faridabad/i

function assignee(lead) {
  const t = String(lead.territory || lead.city || '').trim()
  if (NCR.test(t)) return 'Neha Kapoor'
  return 'Sales Team'
}

const { mongoUrl, dbName } = getMongoConnectConfig()
const client = new MongoClient(mongoUrl)
await client.connect()
const db = client.db(dbName)

const filter = {
  orgId,
  status: 'New',
  $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
  $and: [
    { $or: [{ label: 'Hot' }, { score: { $gte: minScore } }] },
    { $or: [{ assignedTo: { $exists: false } }, { assignedTo: '' }, { assignedTo: null }] },
  ],
}

const leads = await db.collection('leads')
  .find(filter, { projection: { _id: 0 } })
  .sort({ score: -1, createdAt: -1 })
  .limit(limit)
  .toArray()

const stats = { orgId, matched: leads.length, assigned: 0, followupsCreated: 0, tasksCreated: 0, dryRun, items: [] }

if (dryRun) {
  stats.items = leads.map((l) => ({
    company: l.company || l.name,
    score: l.score,
    wouldAssignTo: assignee(l),
  }))
  console.log(JSON.stringify(stats, null, 2))
  await client.close()
  process.exit(0)
}

const now = new Date()
const dueAt = new Date(now.getTime() + 86400000).toISOString()

for (const lead of leads) {
  const owner = assignee(lead)
  const pendingFu = await db.collection('follow_ups').findOne({ orgId, leadId: lead.id, status: 'pending' })

  if (!lead.assignedTo) {
    await db.collection('leads').updateOne(
      { orgId, id: lead.id },
      { $set: { assignedTo: owner, assignedAgentId: 'a4', updatedAt: now.toISOString() } },
    )
    await db.collection('lead_assignments').insertOne({
      id: randomUUID(), orgId, leadId: lead.id, assignedTo: owner, assignedBy: 'vps-queue-hot-leads', createdAt: now.toISOString(),
    })
    await db.collection('lead_timeline').insertOne({
      id: randomUUID(), orgId, leadId: lead.id, type: 'assigned', title: 'Hot lead queued',
      payload: { to: owner, source: 'vps-queue-hot-leads-standalone' }, createdAt: now.toISOString(),
    })
    stats.assigned++
  }

  if (!pendingFu) {
    await db.collection('follow_ups').insertOne({
      id: randomUUID(), orgId, leadId: lead.id, title: 'Initial Call — Hot Lead',
      notes: 'Call within 24h. Introduce LeadEdge360 CRM + Geo Lead Finder demo.',
      channel: lead.phone ? 'whatsapp' : 'call', dueAt, status: 'pending', createdAt: now.toISOString(),
    })
    stats.followupsCreated++
  }

  const openTask = await db.collection('lead_tasks').findOne({ orgId, leadId: lead.id, status: 'open' })
  if (!openTask) {
    await db.collection('lead_tasks').insertOne({
      id: randomUUID(), orgId, leadId: lead.id, title: 'Call Hot Lead',
      description: `Outbound to ${lead.company || lead.name || 'lead'} — score ${lead.score ?? '—'}`,
      priority: 'high', status: 'open', dueAt, createdAt: now.toISOString(),
    })
    stats.tasksCreated++
  }

  stats.items.push({ company: lead.company || lead.name, assignedTo: owner, score: lead.score })
}

console.log(JSON.stringify(stats, null, 2))
await client.close()

#!/usr/bin/env node
/**
 * Seed AsoftechInsightz marketing launch kit:
 * - Marketing Engine config
 * - 7 LinkedIn posts (Week 1 calendar)
 * - 3 Growth Audit nurture email templates + draft campaigns
 *
 * Usage:
 *   npm run marketing-engine:seed-asoftech
 *   npm run marketing-engine:seed-asoftech -- --dry-run
 *   MARKETING_SEED_ORG_ID=asoftechinsightz npm run marketing-engine:seed-asoftech
 */
import { MongoClient } from 'mongodb'
import { randomUUID } from 'crypto'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'
import { COLLECTIONS } from '../lib/marketing-engine/constants.js'
import { insertContentBatch, upsertCalendarEntry } from '../lib/marketing-engine/content-store.js'
import {
  ORG_ID,
  SEED_BATCH,
  MARKETING_CONFIG,
  LINKEDIN_WEEK1,
  NURTURE_EMAILS,
} from '../lib/marketing-engine/seeds/asoftechinsightz-launch.js'

loadEnvForScripts()

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')

async function resolveSeedOrgId(db) {
  const explicit = process.env.MARKETING_SEED_ORG_ID?.trim()
  if (explicit) return explicit

  const org = await db.collection('organizations').findOne({ id: ORG_ID })
  if (org) return ORG_ID

  const admin = await db.collection('users').findOne(
    { email: process.env.CERT_ADMIN_EMAIL || 'admin@asoftechinsightz.com' },
    { projection: { orgId: 1 } },
  )
  if (admin?.orgId) {
    console.warn(`  warn  org "${ORG_ID}" not found — using admin orgId: ${admin.orgId}`)
    return admin.orgId
  }

  return ORG_ID
}

function weekIdForDate(date = new Date()) {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff))
  return monday.toISOString().slice(0, 10)
}

function scheduleIst(weekStart, dayOffset, slot) {
  const base = new Date(`${weekStart}T00:00:00.000Z`)
  base.setUTCDate(base.getUTCDate() + dayOffset)
  const [hh, mm] = slot.split(':').map(Number)
  const utcMinutes = hh * 60 + mm - 330
  const dayAdjust = utcMinutes < 0 ? -1 : 0
  const mins = ((utcMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  base.setUTCDate(base.getUTCDate() + dayAdjust)
  base.setUTCHours(Math.floor(mins / 60), mins % 60, 0, 0)
  return { scheduledAt: base.toISOString(), slot }
}

async function seedConfig(db, orgId) {
  const now = new Date().toISOString()
  if (dryRun) {
    console.log(`  [dry-run] config → ${COLLECTIONS.CONFIG} orgId=${orgId}`)
    return
  }
  await db.collection(COLLECTIONS.CONFIG).updateOne(
    { orgId },
    { $set: { ...MARKETING_CONFIG, orgId, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true },
  )
  console.log(`  ok    marketing config for ${orgId}`)
}

async function seedLinkedIn(db, orgId, weekId) {
  const existing = await db.collection(COLLECTIONS.CONTENT).countDocuments({
    orgId,
    'metadata.seedBatch': SEED_BATCH,
  })
  if (existing >= LINKEDIN_WEEK1.length) {
    console.log(`  skip  LinkedIn week1 (${existing} posts already seeded)`)
    return { inserted: 0, skipped: LINKEDIN_WEEK1.length }
  }

  const items = LINKEDIN_WEEK1.map((post) => {
    const { scheduledAt, slot } = scheduleIst(weekId, post.day, post.slot)
    return {
      type: 'linkedin_post',
      platform: 'linkedin',
      format: 'text',
      product: 'leadedge360',
      title: post.title,
      body: post.body,
      hashtags: ['#LeadEdge360', '#AsoftechInsightz', '#IndianSaaS'],
      cta: `Growth Audit → asoftechinsightz.com/growth-audit`,
      engine: 'seed',
      weekId,
      scheduledAt,
      slot,
      status: 'scheduled',
      metadata: { seedBatch: SEED_BATCH, pillar: post.pillar },
    }
  })

  if (dryRun) {
    console.log(`  [dry-run] ${items.length} LinkedIn posts for week ${weekId}`)
    return { inserted: items.length, skipped: 0 }
  }

  const stored = await insertContentBatch(db, orgId, items, { weekId, plannerRunId: `seed-${SEED_BATCH}` })
  for (const doc of stored.docs || []) {
    await upsertCalendarEntry(db, orgId, {
      contentId: doc.id,
      platform: doc.platform,
      scheduledAt: doc.scheduledAt,
      slot: doc.slot,
      status: 'scheduled',
    })
  }
  console.log(`  ok    ${stored.inserted} LinkedIn posts (${stored.skipped} dupes skipped)`)
  return stored
}

async function seedNurtureEmails(db, orgId) {
  const now = new Date().toISOString()
  let templatesUpserted = 0
  let campaignsCreated = 0

  for (const email of NURTURE_EMAILS) {
    if (dryRun) {
      console.log(`  [dry-run] template: ${email.name}`)
      templatesUpserted++
      continue
    }
    const result = await db.collection('email_templates').updateOne(
      { id: email.id, orgId },
      {
        $set: {
          id: email.id,
          orgId,
          name: email.name,
          subject: email.subject,
          body: email.body,
          status: 'active',
          category: 'growth_audit_nurture',
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    )
    if (result.upsertedCount || result.modifiedCount) templatesUpserted++
  }
  console.log(`  ok    ${templatesUpserted} nurture email templates`)

  const steps = MARKETING_CONFIG.nurtureSequences.growthAudit.steps
  for (const step of steps) {
    const existing = await db.collection('campaigns').findOne({ orgId, name: step.campaignName })
    if (existing) continue

    if (dryRun) {
      console.log(`  [dry-run] campaign: ${step.campaignName}`)
      campaignsCreated++
      continue
    }

    await db.collection('campaigns').insertOne({
      id: randomUUID(),
      orgId,
      name: step.campaignName,
      channel: 'email',
      status: 'draft',
      audience: MARKETING_CONFIG.nurtureSequences.growthAudit.audience,
      templateId: step.templateId,
      metadata: {
        nurtureSequence: 'growthAudit',
        sendOnDay: step.day,
        seedBatch: SEED_BATCH,
      },
      createdBy: 'marketing-engine-seed',
      createdAt: now,
      updatedAt: now,
    })
    campaignsCreated++
  }
  console.log(`  ok    ${campaignsCreated} nurture campaigns (draft)`)
}

async function main() {
  const { mongoUrl, dbName } = getMongoConnectConfig()
  const weekId = weekIdForDate(new Date())

  const client = new MongoClient(mongoUrl)
  await client.connect()
  const db = client.db(dbName)
  const orgId = await resolveSeedOrgId(db)

  console.log(`\n[marketing-engine-seed] org=${orgId} week=${weekId}${dryRun ? ' (dry-run)' : ''}\n`)

  try {
    await seedConfig(db, orgId)
    await seedLinkedIn(db, orgId, weekId)
    await seedNurtureEmails(db, orgId)

    console.log('\n[marketing-engine-seed] done')
    console.log('Next steps:')
    console.log(`  1. Set GROWTH_AUDIT_ORG_ID=${orgId} in .env`)
    console.log('  2. Open /marketing-engine → Run Today\'s Pipeline')
    console.log('  3. npm run marketing-engine:diagnose  (verify org match)')
    console.log('  4. Hard-refresh browser (Ctrl+Shift+R) to see new UI\n')
  } finally {
    await client.close()
  }
}

main().catch((err) => {
  console.error('[marketing-engine-seed] failed:', err.message)
  process.exit(1)
})

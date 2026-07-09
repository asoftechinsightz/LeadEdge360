#!/usr/bin/env node
/**
 * MongoDB indexes for AI Marketing Engine collections.
 * Usage: node scripts/marketing-engine-indexes.mjs
 */
import { MongoClient } from 'mongodb'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'
import { COLLECTIONS } from '../lib/marketing-engine/constants.js'

loadEnvForScripts()
const { mongoUrl, dbName } = getMongoConnectConfig()

const INDEXES = [
  { collection: COLLECTIONS.CONTENT, key: { orgId: 1, weekId: 1 }, options: { name: 'mkt_content_org_week' } },
  { collection: COLLECTIONS.CONTENT, key: { orgId: 1, contentHash: 1 }, options: { unique: true, name: 'mkt_content_hash_unique' } },
  { collection: COLLECTIONS.CONTENT, key: { orgId: 1, status: 1, createdAt: -1 }, options: { name: 'mkt_content_org_status' } },
  { collection: COLLECTIONS.CALENDAR, key: { orgId: 1, scheduledAt: 1 }, options: { name: 'mkt_calendar_scheduled' } },
  { collection: COLLECTIONS.CALENDAR, key: { orgId: 1, status: 1, scheduledAt: 1 }, options: { name: 'mkt_calendar_due' } },
  { collection: COLLECTIONS.PUBLISH_LOG, key: { orgId: 1, bodyHash: 1 }, options: { unique: true, name: 'mkt_publish_hash_unique' } },
  { collection: COLLECTIONS.PUBLISH_QUEUE, key: { orgId: 1, createdAt: -1 }, options: { name: 'mkt_publish_queue_org' } },
  { collection: COLLECTIONS.ASSETS, key: { orgId: 1, status: 1 }, options: { name: 'mkt_assets_org_status' } },
  { collection: COLLECTIONS.VIDEO_BRIEFS, key: { orgId: 1, status: 1 }, options: { name: 'mkt_video_briefs_org' } },
  { collection: COLLECTIONS.CONFIG, key: { orgId: 1 }, options: { unique: true, name: 'mkt_config_org_unique' } },
  { collection: COLLECTIONS.JOBS, key: { orgId: 1, createdAt: -1 }, options: { name: 'mkt_jobs_org_created' } },
  { collection: 'marketing_followup_state', key: { orgId: 1, leadId: 1 }, options: { unique: true, name: 'mkt_followup_state_unique' } },
  { collection: COLLECTIONS.RESEARCH, key: { orgId: 1, day: 1 }, options: { unique: true, name: 'mkt_research_org_day' } },
  { collection: COLLECTIONS.REPORTS, key: { orgId: 1, day: 1, type: 1 }, options: { name: 'mkt_reports_org_day' } },
  { collection: COLLECTIONS.AGENT_RUNS, key: { orgId: 1, agentId: 1, day: 1 }, options: { unique: true, name: 'mkt_agent_runs_unique' } },
  { collection: COLLECTIONS.ENGAGEMENT, key: { orgId: 1, status: 1, createdAt: -1 }, options: { name: 'mkt_engagement_org_status' } },
]

async function ensureCollections(db) {
  const names = [...new Set(INDEXES.map((i) => i.collection))]
  for (const name of names) {
    const exists = await db.listCollections({ name }, { nameOnly: true }).hasNext()
    if (!exists) {
      await db.createCollection(name)
      console.log(`  init  ${name}`)
    }
  }
}

async function listIndexesSafe(coll) {
  try {
    return await coll.indexes()
  } catch (err) {
    if (err.codeName === 'NamespaceNotFound' || /ns does not exist/i.test(err.message)) {
      return []
    }
    throw err
  }
}

async function main() {
  const client = new MongoClient(mongoUrl)
  await client.connect()
  const db = client.db(dbName)
  let created = 0
  let skipped = 0

  await ensureCollections(db)

  for (const { collection, key, options } of INDEXES) {
    const name = options.name
    const coll = db.collection(collection)
    const existing = await listIndexesSafe(coll)
    if (existing.some((i) => i.name === name)) {
      console.log(`  skip  ${collection}.${name}`)
      skipped++
      continue
    }
    try {
      await coll.createIndex(key, { ...options, background: true })
      console.log(`  ok    ${collection}.${name}`)
      created++
    } catch (err) {
      console.log(`  warn  ${collection}.${name} — ${err.message}`)
    }
  }

  await client.close()
  console.log(`\n[marketing-engine-indexes] ${created} created, ${skipped} skipped\n`)
}

main().catch((err) => {
  console.error('[marketing-engine-indexes] failed:', err.message)
  process.exit(1)
})

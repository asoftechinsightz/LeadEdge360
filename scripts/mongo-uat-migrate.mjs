/**
 * UAT production defect fixes — one-time / idempotent data migration.
 *
 * What it does:
 *  1. Seeds `territories` from distinct `leads.territory` values (per org)
 *  2. Backfills `lead_assignments.assignedBy` where missing
 *  3. Normalizes lead `territory` strings (trim)
 *  4. Reports soft-delete field readiness (no destructive changes)
 *
 * Usage:
 *   node scripts/mongo-uat-migrate.mjs
 *   node scripts/mongo-uat-migrate.mjs --dry-run
 *   node scripts/mongo-uat-migrate.mjs --org-id=demo-org
 *
 * Run AFTER: npm run db:indexes
 */
import { MongoClient } from 'mongodb'
import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'

loadEnvForScripts()
const { mongoUrl: MONGO_URL, dbName: DB_NAME } = getMongoConnectConfig()

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const dryRun = process.argv.includes('--dry-run')
const orgArg = process.argv.find((a) => a.startsWith('--org-id='))
const onlyOrgId = orgArg ? orgArg.split('=')[1] : null



const DEFAULT_TERRITORIES = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune']

function slugCode(name) {
  return String(name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 24)
}

async function seedTerritoriesForOrg(db, orgId, stats) {
  const territories = db.collection('territories')
  const leads = db.collection('leads')

  const distinct = await leads.distinct('territory', {
    orgId,
    territory: { $exists: true, $nin: [null, ''] },
  })

  const names = new Set([
    ...DEFAULT_TERRITORIES,
    ...distinct.map((t) => String(t).trim()).filter(Boolean),
  ])

  for (const name of names) {
    const existing = await territories.findOne({ orgId, name })
    if (existing) {
      stats.territoriesSkipped++
      continue
    }

    const doc = {
      id: randomUUID(),
      orgId,
      name,
      code: slugCode(name),
      region: 'India',
      manager: '',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'migration',
      updatedBy: 'migration',
    }

    if (dryRun) {
      console.log(`  [dry-run] insert territory ${orgId} → ${name}`)
    } else {
      await territories.insertOne(doc)
    }
    stats.territoriesCreated++
  }
}

async function backfillAssignments(db, orgId, stats) {
  const col = db.collection('lead_assignments')
  const cursor = col.find({
    orgId,
    $or: [{ assignedBy: { $exists: false } }, { assignedBy: null }, { assignedBy: '' }],
  })

  for await (const row of cursor) {
    if (dryRun) {
      console.log(`  [dry-run] backfill assignedBy on assignment ${row.id}`)
      stats.assignmentsBackfilled++
      continue
    }
    const result = await col.updateOne(
      { _id: row._id },
      { $set: { assignedBy: 'Admin', updatedAt: new Date().toISOString() } },
    )
    stats.assignmentsBackfilled += result.modifiedCount
  }
}

async function normalizeLeadTerritories(db, orgId, stats) {
  const col = db.collection('leads')
  const cursor = col.find({
    orgId,
    territory: { $type: 'string', $regex: /^\s|\s$/ },
  }, { projection: { _id: 1, territory: 1 } })

  for await (const lead of cursor) {
    const trimmed = String(lead.territory).trim()
    if (dryRun) {
      console.log(`  [dry-run] trim territory on lead ${lead._id}`)
      stats.leadsNormalized++
      continue
    }
    const result = await col.updateOne(
      { _id: lead._id },
      { $set: { territory: trimmed, updatedAt: new Date().toISOString() } },
    )
    stats.leadsNormalized += result.modifiedCount
  }
}

async function reportSoftDeleteReadiness(db, orgId, stats) {
  const col = db.collection('leads')
  const deleted = await col.countDocuments({ orgId, deletedAt: { $exists: true, $ne: null } })
  const active = await col.countDocuments({
    orgId,
    $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
  })
  stats.deletedLeads += deleted
  stats.activeLeads += active
}

async function main() {
  console.log(`[mongo-uat-migrate] ${dryRun ? 'DRY RUN' : 'APPLY'} — ${DB_NAME}`)

  const client = new MongoClient(MONGO_URL)
  await client.connect()
  const db = client.db(DB_NAME)

  const stats = {
    orgsProcessed: 0,
    territoriesCreated: 0,
    territoriesSkipped: 0,
    assignmentsBackfilled: 0,
    leadsNormalized: 0,
    deletedLeads: 0,
    activeLeads: 0,
  }

  const orgFilter = onlyOrgId ? { id: onlyOrgId } : {}
  const orgs = await db.collection('orgs').find(orgFilter, { projection: { _id: 0, id: 1, name: 1 } }).toArray()

  if (!orgs.length) {
    const leadOrgIds = await db.collection('leads').distinct('orgId', onlyOrgId ? { orgId: onlyOrgId } : {})
    for (const orgId of leadOrgIds.filter(Boolean)) {
      orgs.push({ id: orgId, name: orgId })
    }
  }

  for (const org of orgs) {
    const orgId = org.id
    if (!orgId) continue
    console.log(`\n▶ Org: ${orgId} (${org.name || '—'})`)
    stats.orgsProcessed++
    await seedTerritoriesForOrg(db, orgId, stats)
    await backfillAssignments(db, orgId, stats)
    await normalizeLeadTerritories(db, orgId, stats)
    await reportSoftDeleteReadiness(db, orgId, stats)
  }

  await client.close()

  console.log('\n[mongo-uat-migrate] summary')
  console.log(`  orgs processed:        ${stats.orgsProcessed}`)
  console.log(`  territories created:   ${stats.territoriesCreated}`)
  console.log(`  territories skipped:   ${stats.territoriesSkipped}`)
  console.log(`  assignments backfill:  ${stats.assignmentsBackfilled}`)
  console.log(`  leads normalized:      ${stats.leadsNormalized}`)
  console.log(`  active leads (total):  ${stats.activeLeads}`)
  console.log(`  soft-deleted leads:    ${stats.deletedLeads}`)
  console.log('[mongo-uat-migrate] done\n')
}

main().catch((err) => {
  console.error('[mongo-uat-migrate] failed:', err.message)
  process.exit(1)
})

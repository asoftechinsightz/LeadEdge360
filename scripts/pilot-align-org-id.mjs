#!/usr/bin/env node
/**
 * Align an existing admin user's orgId to a stable pilot slug (e.g. asoftechinsightz).
 * Use when bootstrap/registration created a UUID org but pilot:provision expects a slug.
 *
 * Usage:
 *   PILOT_ADMIN_EMAIL=admin@asoftechinsightz.com \
 *   PILOT_ORG_ID=asoftechinsightz \
 *   npm run pilot:align-org -- --from-email
 *
 *   npm run pilot:align-org -- --old-org=b93f5303-... --new-org=asoftechinsightz
 *
 * Flags:
 *   --from-email     Resolve old orgId from PILOT_ADMIN_EMAIL / --email=
 *   --email=         Admin email (default: PILOT_ADMIN_EMAIL)
 *   --old-org=       Source orgId (required unless --from-email)
 *   --new-org=       Target orgId (default: PILOT_ORG_ID or asoftechinsightz)
 *   --dry-run        Print planned updates only
 *
 * Docs: docs/platform/ASOFTECHINSIGHTZ_PILOT_VALIDATION.md
 */
import { MongoClient } from 'mongodb'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'

loadEnvForScripts()

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const fromEmail = args.includes('--from-email')

function argValue(prefix) {
  const hit = args.find((a) => a.startsWith(`${prefix}=`))
  return hit ? hit.slice(prefix.length + 1).trim() : ''
}

const adminEmail = argValue('--email') || process.env.PILOT_ADMIN_EMAIL || 'admin@asoftechinsightz.com'
let oldOrgId = argValue('--old-org') || process.env.PILOT_ALIGN_OLD_ORG || ''
const newOrgId = argValue('--new-org') || process.env.PILOT_ORG_ID || 'asoftechinsightz'

if (!newOrgId) {
  console.error('[pilot:align-org] --new-org or PILOT_ORG_ID required')
  process.exit(1)
}

async function collectionsWithOrgId(db, orgId) {
  const names = (await db.listCollections().toArray()).map((c) => c.name).sort()
  const hits = []
  for (const name of names) {
    if (name === 'orgs') continue
    const count = await db.collection(name).countDocuments({ orgId })
    if (count > 0) hits.push({ name, count })
  }
  return hits
}

async function main() {
  const { mongoUrl, dbName } = getMongoConnectConfig()
  const client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 15000 })
  await client.connect()
  const db = client.db(dbName)
  const now = new Date().toISOString()

  try {
    if (fromEmail || !oldOrgId) {
      const user = await db.collection('users').findOne({ email: adminEmail })
      if (!user) {
        console.error(`[pilot:align-org] No user found for ${adminEmail}`)
        process.exit(1)
      }
      oldOrgId = user.orgId
      console.log(`[pilot:align-org] ${adminEmail} → current orgId: ${oldOrgId}`)
    }

    if (!oldOrgId) {
      console.error('[pilot:align-org] --old-org or --from-email required')
      process.exit(1)
    }

    if (oldOrgId === newOrgId) {
      console.log(`[pilot:align-org] orgId already ${newOrgId} — nothing to do`)
      return
    }

    const targetOrgExists = await db.collection('orgs').findOne({ id: newOrgId })
    const sourceOrg = await db.collection('orgs').findOne({ id: oldOrgId })
    const hits = await collectionsWithOrgId(db, oldOrgId)

    console.log(`\n[pilot:align-org] ${dbName}`)
    console.log(`  ${oldOrgId}  →  ${newOrgId}`)
    console.log(`  mode: ${dryRun ? 'DRY RUN' : 'APPLY'}`)
    console.log(`  collections with orgId=${oldOrgId}: ${hits.length}`)
    for (const { name, count } of hits) {
      console.log(`    ${name}: ${count}`)
    }

    if (targetOrgExists && sourceOrg) {
      console.log(`  WARN target org ${newOrgId} already exists — will merge org doc fields`)
    }

    if (dryRun) {
      console.log('\n[dry-run] no writes performed')
      return
    }

    let totalDocs = 0
    for (const { name, count } of hits) {
      const result = await db.collection(name).updateMany(
        { orgId: oldOrgId },
        { $set: { orgId: newOrgId, updatedAt: now } },
      )
      totalDocs += result.modifiedCount
      console.log(`[migrate] ${name}: ${result.modifiedCount}/${count}`)
    }

    if (sourceOrg) {
      const { _id, createdAt, ...rest } = sourceOrg
      await db.collection('orgs').updateOne(
        { id: newOrgId },
        {
          $set: {
            ...rest,
            id: newOrgId,
            name: rest.name || process.env.PILOT_ORG_NAME || 'AsoftechInsightz Pvt Ltd',
            ownerEmail: rest.ownerEmail || adminEmail,
            pilot: true,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: createdAt || now },
        },
        { upsert: true },
      )
      if (oldOrgId !== newOrgId) {
        await db.collection('orgs').deleteOne({ id: oldOrgId })
      }
      console.log(`[org] migrated org document → ${newOrgId}`)
    } else {
      await db.collection('orgs').updateOne(
        { id: newOrgId },
        {
          $set: {
            id: newOrgId,
            name: process.env.PILOT_ORG_NAME || 'AsoftechInsightz Pvt Ltd',
            ownerEmail: adminEmail,
            plan: 'scale',
            leadEnabled: true,
            retailEnabled: true,
            pilot: true,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true },
      )
      console.log(`[org] created org document ${newOrgId}`)
    }

    const userResult = await db.collection('users').updateMany(
      { orgId: oldOrgId },
      { $set: { orgId: newOrgId, updatedAt: now } },
    )
    if (userResult.modifiedCount > 0) {
      console.log(`[users] updated ${userResult.modifiedCount} user(s)`)
    }

    // Cleanup orphaned source org doc if collections were already migrated
    if (oldOrgId !== newOrgId) {
      const orphan = await db.collection('orgs').findOne({ id: oldOrgId })
      if (orphan) {
        const remaining = await collectionsWithOrgId(db, oldOrgId)
        if (remaining.length === 0) {
          await db.collection('orgs').deleteOne({ id: oldOrgId })
          console.log(`[org] removed orphaned org document ${oldOrgId}`)
        }
      }
    }

    console.log(`\n[pilot:align-org] done — ${totalDocs} documents migrated`)
    console.log('Next:')
    console.log(`  ADMIN_EMAIL=${adminEmail} ADMIN_PASSWORD='...' npm run db:set-password`)
    console.log('  npm run pilot:provision -- --seed-sample')
  } finally {
    await client.close()
  }
}

main().catch((err) => {
  console.error('[pilot:align-org] failed:', err.message)
  process.exit(1)
})

#!/usr/bin/env node
/**
 * Diagnose marketing engine org + data mismatch.
 * Usage: npm run marketing-engine:diagnose
 */
import { MongoClient } from 'mongodb'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'
import { COLLECTIONS } from '../lib/marketing-engine/constants.js'

loadEnvForScripts()

async function main() {
  const { mongoUrl, dbName } = getMongoConnectConfig()
  const client = new MongoClient(mongoUrl)
  await client.connect()
  const db = client.db(dbName)

  console.log('\n[marketing-engine-diagnose]\n')

  const admin = await db.collection('users').findOne(
    { email: 'admin@asoftechinsightz.com' },
    { projection: { _id: 0, email: 1, orgId: 1, role: 1 } },
  )
  console.log('Admin user:', admin ? `${admin.email} → orgId=${admin.orgId}` : 'NOT FOUND')

  const orgs = await db.collection('organizations')
    .find({}, { projection: { _id: 0, id: 1, name: 1 } })
    .limit(10)
    .toArray()
  console.log('\nOrganizations:', orgs.map((o) => o.id).join(', ') || '(none)')

  const contentByOrg = await db.collection(COLLECTIONS.CONTENT).aggregate([
    { $group: { _id: '$orgId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray()

  console.log('\nMarketing content by orgId:')
  if (!contentByOrg.length) console.log('  (no content — run npm run marketing-engine:seed-asoftech)')
  for (const row of contentByOrg) {
    console.log(`  ${row._id}: ${row.count} items`)
  }

  const calendarByOrg = await db.collection(COLLECTIONS.CALENDAR).aggregate([
    { $group: { _id: '$orgId', count: { $sum: 1 } } },
  ]).toArray()
  console.log('\nCalendar entries by orgId:')
  for (const row of calendarByOrg) {
    console.log(`  ${row._id}: ${row.count} entries`)
  }

  const uiCheck = await import('fs').then((fs) =>
    fs.existsSync('app/marketing-engine/page.js')
      ? fs.readFileSync('app/marketing-engine/page.js', 'utf8').includes('Digital Marketing Employee')
      : false,
  )
  console.log('\nUI version:', uiCheck ? 'NEW (AI Digital Marketing Employee)' : 'OLD (needs bundle re-upload)')

  if (admin?.orgId && contentByOrg.length) {
    const adminContent = contentByOrg.find((r) => r._id === admin.orgId)
    if (!adminContent) {
      const seededOrg = contentByOrg[0]?._id
      console.log('\n⚠️  MISMATCH: Admin orgId has no marketing content.')
      console.log(`   Fix: MARKETING_SEED_ORG_ID=${admin.orgId} npm run marketing-engine:seed-asoftech`)
      if (seededOrg && seededOrg !== admin.orgId) {
        console.log(`   Or migrate: content is under "${seededOrg}" but you login as "${admin.orgId}"`)
      }
    } else {
      console.log('\n✓ Admin orgId matches marketing content.')
    }
  }

  console.log('')
  await client.close()
}

main().catch((err) => {
  console.error('[marketing-engine-diagnose] failed:', err.message)
  process.exit(1)
})

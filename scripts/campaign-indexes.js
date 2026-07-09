import { getDb } from '@/lib/mongo'

const db = await getDb()

await db.collection('campaigns')
  .createIndex({
    orgId: 1,
    createdAt: -1
  })

await db.collection('campaigns')
  .createIndex({
    orgId: 1,
    status: 1
  })

console.log('campaign indexes created')
process.exit(0)

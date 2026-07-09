import { MongoClient } from 'mongodb'

let clientPromise = null
let devSeedDone = false

const uri =
  process.env.MONGO_URL ||
  (process.env.NODE_ENV !== 'production' ? 'mongodb://127.0.0.1:27017' : null)
const dbName = process.env.DB_NAME || 'asoftech'

export async function getDb() {
  if (!uri) {
    throw new Error('MONGO_URL environment variable is not configured')
  }

  if (!clientPromise) {
    const client = new MongoClient(uri)
    clientPromise = client.connect()
  }

  const client = await clientPromise
  const db = client.db(dbName)

  if (process.env.NODE_ENV !== 'production' && !devSeedDone) {
    devSeedDone = true
    try {
      const { ensureDevAdmin } = await import('./dev-seed')
      await ensureDevAdmin(db)
      const { ensureDevDemoData } = await import('./demo-seed')
      await ensureDevDemoData(db)
    } catch (e) {
      console.warn('[dev-seed] skipped:', e?.message || e)
    }
  }

  return db
}

export default getDb

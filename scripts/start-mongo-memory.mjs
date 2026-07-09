/**
 * Start in-memory MongoDB on port 27017 for local Leads testing.
 * Run in background: node scripts/start-mongo-memory.mjs
 */
import { MongoMemoryServer } from 'mongodb-memory-server'

const mongod = await MongoMemoryServer.create({
  instance: { port: 27017, dbName: 'asoftech' },
})

const uri = mongod.getUri()
console.log(`[mongo-memory] listening on ${uri}`)
console.log('[mongo-memory] Press Ctrl+C to stop')

process.on('SIGINT', async () => {
  await mongod.stop()
  process.exit(0)
})

// Keep alive
await new Promise(() => {})

/**
 * Test MongoDB connection (Atlas, Docker, or local) — no data changes.
 * Usage: npm run db:check
 */
import { loadEnvForScripts, validateMongoConnection, maskMongoUrl } from '../lib/mongo-connect.js'

async function main() {
  loadEnvForScripts()
  const result = await validateMongoConnection()
  console.log(`\n[mongo-atlas-check] Connecting to ${maskMongoUrl(result.mongoUrl)}`)
  console.log(`[mongo-atlas-check] Database: ${result.dbName}`)
  console.log(`[mongo-atlas-check] Execution mode: ${result.executionMode} (host: ${result.expectedHost})`)
  console.log(`  ping: OK`)
  console.log(`  collections: ${result.collections}`)
  console.log('\n[mongo-atlas-check] Connection successful.')
  console.log('Next: npm run db:bootstrap\n')
}

main().catch((err) => {
  console.error('\n[mongo-atlas-check] FAILED')
  console.error(err.message)
  process.exit(1)
})

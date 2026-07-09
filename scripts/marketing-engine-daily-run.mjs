#!/usr/bin/env node
/**
 * Run full daily marketing pipeline directly (no HTTP).
 * Usage: node scripts/marketing-engine-daily-run.mjs [--org asoftechinsightz]
 */
import { MongoClient } from 'mongodb'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'
import { runFullDailyPipeline } from '../lib/marketing-engine/daily-orchestrator.js'

loadEnvForScripts()
const { mongoUrl, dbName } = getMongoConnectConfig()
const orgId = process.argv.includes('--org')
  ? process.argv[process.argv.indexOf('--org') + 1]
  : (process.env.GROWTH_AUDIT_ORG_ID || 'asoftechinsightz')

async function main() {
  const client = new MongoClient(mongoUrl)
  await client.connect()
  const db = client.db(dbName)
  console.log(`Running full daily pipeline for orgId=${orgId}\n`)
  try {
    const result = await runFullDailyPipeline(db, orgId)
    console.log(JSON.stringify(result, null, 2))
  } catch (err) {
    console.error('PIPELINE FAILED:', err.message)
    console.error(err.stack)
    process.exitCode = 1
  } finally {
    await client.close()
  }
}

main()

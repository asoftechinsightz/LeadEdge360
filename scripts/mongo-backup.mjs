/**
 * MongoDB backup script
 * Usage: node scripts/mongo-backup.mjs [outputDir]
 */
import { execSync } from 'child_process'
import { mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

loadEnvForScripts()
const { mongoUrl: MONGO_URL, dbName: DB_NAME } = getMongoConnectConfig()
const outDir = process.argv[2] || resolve(root, 'backups', `mongo-${Date.now()}`)

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

try {
  execSync(`mongodump --uri="${MONGO_URL}" --db="${DB_NAME}" --out="${outDir}"`, { stdio: 'inherit' })
  console.log(`[mongo-backup] OK → ${outDir}`)
  process.exit(0)
} catch (e) {
  console.error('[mongo-backup] FAILED — ensure mongodump is installed and MongoDB is reachable')
  console.error(e.message)
  process.exit(1)
}

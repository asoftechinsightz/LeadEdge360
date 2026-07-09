/**
 * MongoDB restore script
 * Usage: node scripts/mongo-restore.mjs <backupDir>
 */
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'

loadEnvForScripts()
const { mongoUrl: MONGO_URL, dbName: DB_NAME } = getMongoConnectConfig()

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')


const backupDir = process.argv[2]
if (!backupDir || !existsSync(backupDir)) {
  console.error('Usage: node scripts/mongo-restore.mjs <backupDir>')
  process.exit(1)
}


try {
  execSync(`mongorestore --uri="${MONGO_URL}" --db="${DB_NAME}" --drop "${resolve(backupDir, DB_NAME)}"`, { stdio: 'inherit' })
  console.log(`[mongo-restore] OK from ${backupDir}`)
  process.exit(0)
} catch (e) {
  console.error('[mongo-restore] FAILED')
  console.error(e.message)
  process.exit(1)
}

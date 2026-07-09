/**
 * CLI wrapper — re-exports lib/mongo-connect.js for scripts/ imports.
 * Usage:
 *   node scripts/mongo-connect-env.mjs --shell
 *   node scripts/mongo-connect-env.mjs --validate
 */
export {
  loadEnvForScripts,
  loadEnvFile,
  getMongoConnectConfig,
  resolveMongoConnectEnv,
  detectExecutionMode,
  validateMongoConnection,
  connectMongoClient,
  printShellExports,
  maskMongoUrl,
  formatMongoConnectionError,
} from '../lib/mongo-connect.js'

import { loadEnvForScripts, printShellExports, validateMongoConnection } from '../lib/mongo-connect.js'

if (process.argv.includes('--shell')) {
  loadEnvForScripts()
  printShellExports()
} else if (process.argv.includes('--validate')) {
  validateMongoConnection()
    .then((r) => {
      console.log(`\n[mongo-connect] Connection successful.`)
      console.log(`  mode: ${r.executionMode}  host: ${r.expectedHost}  db: ${r.dbName}`)
      console.log(`  collections: ${r.collections}\n`)
    })
    .catch((e) => {
      console.error(e.message)
      process.exit(1)
    })
}

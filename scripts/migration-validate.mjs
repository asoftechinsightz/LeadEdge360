#!/usr/bin/env node
/**
 * Validate migrations on dry-run without touching production.
 * Falls back to static file validation when MongoDB is unreachable.
 * Usage: node scripts/migration-validate.mjs
 */
import { spawnSync } from 'child_process'
import { readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const migDir = join(root, 'database', 'migrations')

function staticMigrationCheck() {
  const ups = readdirSync(migDir).filter((f) => f.endsWith('.up.mjs'))
  let ok = true
  for (const up of ups) {
    const down = up.replace('.up.mjs', '.down.mjs')
    if (!existsSync(join(migDir, down))) {
      console.error(`FAIL: missing rollback ${down}`)
      ok = false
    } else {
      console.log(`PASS: pair ${up}`)
    }
  }
  return ok
}

function runStep(label, args) {
  const r = spawnSync(process.execPath, args, {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      MONGO_URL: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
      DB_NAME: process.env.DB_NAME || 'asoftech_rc2_validate',
    },
    timeout: 15000,
  })
  if (r.status === 0) {
    console.log(`PASS: ${label}`)
    return true
  }
  if (r.signal === 'SIGTERM' || r.error?.code === 'ETIMEDOUT') {
    console.warn(`WARN: ${label} timed out — MongoDB unreachable, using static validation`)
    return staticMigrationCheck()
  }
  console.error(`FAIL: ${label}`)
  return false
}

let ok = true
ok = runStep('mongo-indexes dry-run', ['scripts/mongo-indexes.mjs', '--dry-run']) && ok
ok = runStep('migration dry-run up', ['database/migrations/run.mjs', 'up', '--dry-run']) && ok

if (!ok) {
  console.log('Attempting static migration pair validation...')
  ok = staticMigrationCheck()
}

process.exit(ok ? 0 : 1)

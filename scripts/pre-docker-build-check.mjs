#!/usr/bin/env node
/**
 * Verify source tree is complete before `docker compose build app`.
 * Usage: node scripts/pre-docker-build-check.mjs
 */
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const REQUIRED = [
  'app/api/platform/health/route.js',
  'app/api/platform/events/route.js',
  'app/api/activities/route.js',
  'app/api/revenue/dashboard/route.js',
  'lib/billing/plan-map.js',
  'lib/events/monitoring.js',
  'Dockerfile',
  'docker-compose.yml',
  'package.json',
  'yarn.lock',
]

let missing = 0
console.log('\nPre-Docker build source check\n')
for (const rel of REQUIRED) {
  const path = resolve(root, rel)
  if (existsSync(path)) {
    console.log(`  OK   ${rel}`)
  } else {
    console.log(`  FAIL ${rel}`)
    missing++
  }
}

console.log('')
if (missing > 0) {
  console.error(`FAIL: ${missing} required path(s) missing. Sync full repository before docker compose build.`)
  console.error('Missing app/api/platform/* is why /api/platform/health returns 404 after rebuild.\n')
  process.exit(1)
}
console.log('PASS: Source tree ready for docker compose build app --no-cache\n')

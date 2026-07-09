#!/usr/bin/env node
/**
 * Production environment validation before deploy.
 * Usage: node scripts/ops/validate-env.mjs [--stage staging|pilot|production]
 */
import { readFileSync, existsSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const stage = process.argv.includes('--stage')
  ? process.argv[process.argv.indexOf('--stage') + 1]
  : process.env.DEPLOY_STAGE || 'staging'

const REQUIRED_ALL = ['MONGO_URL', 'DB_NAME', 'JWT_SECRET']
const REQUIRED_PROD = [
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_APP_URL',
]
const REQUIRED_PROD_PAYMENTS = [
  'RAZORPAY_KEY_SECRET',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
]
const FORBIDDEN_DEFAULTS = [
  ['JWT_SECRET', 'dev-secret-change-me'],
  ['N8N_WEBHOOK_TOKEN', 'change-me-to-a-long-random-string'],
  ['N8N_WEBHOOK_TOKEN', 'change-me'],
]

function loadEnv() {
  const envPath = join(root, '.env')
  if (!existsSync(envPath)) return process.env
  const merged = { ...process.env }
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    merged[t.slice(0, eq).trim()] = t.slice(eq + 1).trim()
  }
  return merged
}

const env = loadEnv()
let failed = 0

function ok(m) { console.log(`  OK   ${m}`) }
function fail(m) { console.log(`  FAIL ${m}`); failed++ }
function warn(m) { console.log(`  WARN ${m}`) }

console.log(`\nEnvironment validation — stage: ${stage}\n`)

for (const key of REQUIRED_ALL) {
  if (env[key]) ok(key)
  else fail(`${key} missing`)
}

if (stage === 'pilot' || stage === 'production') {
  for (const key of REQUIRED_PROD) {
    if (env[key]) ok(key)
    else fail(`${key} required for ${stage}`)
  }
  for (const key of REQUIRED_PROD_PAYMENTS) {
    if (env[key]) ok(key)
    else if (stage === 'production') fail(`${key} required for production payments`)
    else warn(`${key} unset — optional during pilot; configure before live payments`)
  }
  if (env.DEV_AUTH_BYPASS === 'true') fail('DEV_AUTH_BYPASS must be false in production')
  else ok('DEV_AUTH_BYPASS not enabled')
  if (env.NEXT_PUBLIC_USE_MOCK_API === 'true') warn('NEXT_PUBLIC_USE_MOCK_API=true — disable for production')
  for (const [key, bad] of FORBIDDEN_DEFAULTS) {
    if (env[key] === bad) fail(`${key} still has default value`)
  }
} else {
  ok(`relaxed secret checks for stage=${stage}`)
}

const uploadDir = join(root, 'public', 'uploads')
if (existsSync(uploadDir)) {
  try {
    statSync(uploadDir)
    ok('uploads directory accessible')
  } catch {
    fail('uploads directory not readable')
  }
} else {
  warn('public/uploads missing — will be created on first upload')
}

if (env.REDIS_URL) ok(`REDIS_URL=${env.REDIS_URL.split('@').pop() || 'set'}`)
else warn('REDIS_URL unset — rate limits use Mongo only')

console.log('')
if (failed) {
  console.error(`FAIL: ${failed} environment issue(s)`)
  process.exit(1)
}
console.log('PASS environment validation')
process.exit(0)

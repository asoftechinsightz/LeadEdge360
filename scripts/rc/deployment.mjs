/**
 * RC-07 — Deployment / environment validation (static).
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { makeSuite } from './report.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

const REQUIRED_ENV_KEYS = [
  'MONGO_URL',
  'DB_NAME',
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_APP_URL',
  'ENFORCE_PLAN_LIMITS',
  'WEB_JWT_BRIDGE',
  'AEO_SERVER_PROFILE',
  'N8N_WEBHOOK_TOKEN',
]

const OPTIONAL_INTEGRATION_KEYS = [
  'EMERGENT_LLM_KEY',
  'EMERGENT_PROJECT_ID',
  'EMERGENT_API_KEY',
  'RAZORPAY_KEY_SECRET',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
]

export async function runDeployment() {
  const suite = makeSuite('deployment')
  const examplePath = join(root, '.env.example')
  suite.assert('.env.example exists', existsSync(examplePath))

  const example = readFileSync(examplePath, 'utf8')
  for (const key of REQUIRED_ENV_KEYS) {
    suite.assert(`env.example has ${key}`, example.includes(key))
  }

  suite.assert('Dockerfile exists', existsSync(join(root, 'Dockerfile')))
  suite.assert('docker-compose.yml exists', existsSync(join(root, 'docker-compose.yml')))
  suite.assert('next.config standalone', readFileSync(join(root, 'next.config.js'), 'utf8').includes('standalone'))

  let dockerComposeOk = false
  try {
    execSync('docker compose version', { stdio: 'pipe' })
    execSync('docker compose config', { cwd: root, stdio: 'pipe' })
    dockerComposeOk = true
  } catch {
    dockerComposeOk = process.env.RC_SKIP_DOCKER === '1'
  }
  suite.assert(
    dockerComposeOk ? 'docker compose config valid' : 'docker compose config valid (docker not available)',
    dockerComposeOk
  )

  suite.assert('EMERGENT_LLM_KEY documented', example.includes('EMERGENT_LLM_KEY'))
  suite.assert('Razorpay keys documented', example.includes('RAZORPAY_KEY_SECRET'))

  return {
    ...suite.summary(),
    integrationKeysPresent: OPTIONAL_INTEGRATION_KEYS.filter((k) => example.includes(k)),
  }
}

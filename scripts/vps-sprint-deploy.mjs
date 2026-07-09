#!/usr/bin/env node
/**
 * VPS sprint deployment — run ON the server at /opt/asoftech
 *
 * Usage:
 *   node scripts/vps-sprint-deploy.mjs s2
 *   node scripts/vps-sprint-deploy.mjs s2 --skip-build
 *   node scripts/vps-sprint-deploy.mjs s2 --skip-retest
 *
 * Env:
 *   RETEST_API_BASE=http://127.0.0.1:3007/api  (staging dev server)
 *   SKIP_DOCKER=1                               (skip docker compose mongo)
 */
import { spawn } from 'child_process'
import { readFileSync, appendFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const SPRINT_CONFIG = {
  s0: {
    name: 'S0 Stabilization',
    indexes: true,
    bootstrap: false,
    retest: 'scripts/go-live-retest.mjs',
    deployDoc: 'docs/ops/deployments/S0_STABILIZATION_DEPLOYMENT.md',
  },
  s0h: {
    name: 'S0 Hardening (Phase 1 Sprint 0)',
    indexes: true,
    bootstrap: false,
    retest: 'scripts/sprint0-staging-uat.mjs',
    deployDoc: 'docs/ops/deployments/SPRINT0_HARDENING_DEPLOYMENT.md',
    postRetest: 'scripts/foundation-retest.mjs',
    extraPostRetest: 'scripts/uat-retest.mjs',
    finalRetest: 'scripts/tenant-isolation-retest.mjs',
    lastRetest: 'scripts/go-live-retest.mjs',
  },
  s1: {
    name: 'S1 Business Card',
    indexes: true,
    bootstrap: true,
    retest: null,
    deployDoc: 'docs/ops/deployments/S1_BUSINESS_CARD_DEPLOYMENT.md',
    postRetest: 'scripts/go-live-retest.mjs',
  },
  s2: {
    name: 'S2 QR Engine',
    indexes: true,
    bootstrap: false,
    retest: 'scripts/qr-retest.mjs',
    deployDoc: 'docs/ops/deployments/S2_QR_ENGINE_DEPLOYMENT.md',
    postRetest: 'scripts/go-live-retest.mjs',
  },
  s3: {
    name: 'S3 Reviews',
    indexes: true,
    bootstrap: false,
    retest: 'scripts/reviews-retest.mjs',
    deployDoc: 'docs/ops/deployments/S3_REVIEWS_DEPLOYMENT.md',
    postRetest: 'scripts/go-live-retest.mjs',
  },
  s4: {
    name: 'S4 WhatsApp + AI',
    indexes: true,
    bootstrap: false,
    retest: 'scripts/sprint4-retest.mjs',
    deployDoc: 'docs/ops/deployments/S4_WHATSAPP_AI_DEPLOYMENT.md',
    postRetest: 'scripts/go-live-retest.mjs',
  },
  s5: {
    name: 'S5 Suite Polish',
    indexes: false,
    bootstrap: false,
    retest: 'scripts/sprint5-retest.mjs',
    deployDoc: 'docs/ops/deployments/S5_SUITE_POLISH_DEPLOYMENT.md',
    postRetest: 'scripts/go-live-retest.mjs',
  },
  s6: {
    name: 'S6 Retail Foundation',
    indexes: true,
    bootstrap: false,
    retest: 'scripts/retail-retest.mjs',
    deployDoc: 'docs/ops/deployments/S6_RETAIL_DEPLOYMENT.md',
    postRetest: 'scripts/go-live-retest.mjs',
  },
  uat: {
    name: 'UAT Production Defect Fixes',
    indexes: true,
    bootstrap: false,
    migrate: 'scripts/mongo-uat-migrate.mjs',
    retest: 'scripts/uat-retest.mjs',
    deployDoc: 'docs/ops/deployments/UAT_PRODUCTION_FIXES_DEPLOYMENT.md',
    postRetest: 'scripts/tenant-isolation-retest.mjs',
    extraPostRetest: 'scripts/go-live-retest.mjs',
  },
}

function loadEnv() {
  try {
    const raw = readFileSync(resolve(root, '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  } catch { /* noop */ }
}

function run(cmd, args = [], opts = {}) {
  return new Promise((resolvePromise, reject) => {
    console.log(`\n▶ ${cmd} ${args.join(' ')}\n`)
    const child = spawn(cmd, args, {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, ...opts.env },
    })
    child.on('close', (code) => {
      if (code === 0) resolvePromise()
      else reject(new Error(`${cmd} exited ${code}`))
    })
  })
}

function timestamp() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function appendDeployLog(sprintKey, config, results) {
  const logPath = resolve(root, 'docs/ops/deployments/DEPLOY_LOG.md')
  const header = existsSync(logPath) ? '' : '# VPS Deploy Log\n\n'
  const block = `${header}## ${config.name} — ${timestamp()}\n\n` +
    `- Sprint: \`${sprintKey}\`\n` +
    `- Host: VPS\n` +
    `- DB: ${process.env.DB_NAME || 'asoftech_saas'}\n` +
    `- Indexes: ${results.indexes}\n` +
    `- Build: ${results.build}\n` +
    `- Sprint retest: ${results.retest}\n` +
    `- Go-live retest: ${results.postRetest}\n` +
    `- Status: **${results.overall}**\n\n`
  appendFileSync(logPath, block)
  console.log(`\n✓ Log appended to docs/ops/deployments/DEPLOY_LOG.md\n`)
}

async function main() {
  const sprintKey = (process.argv[2] || '').toLowerCase()
  const skipBuild = process.argv.includes('--skip-build')
  const skipRetest = process.argv.includes('--skip-retest')
  const skipDocker = process.argv.includes('--skip-docker') || process.env.SKIP_DOCKER === '1'

  const config = SPRINT_CONFIG[sprintKey]
  if (!config) {
    console.error('Usage: node scripts/vps-sprint-deploy.mjs <s0|s0h|s1|s2|s3|s4|s5|s6|uat> [--skip-build] [--skip-retest]')
    process.exit(1)
  }

  loadEnv()
  console.log(`\n=== VPS Sprint Deploy: ${config.name} ===\n`)

  const results = {
    indexes: 'skipped',
    build: 'skipped',
    retest: 'skipped',
    postRetest: 'skipped',
    overall: 'PASS',
  }

  try {
    if (!skipDocker) {
      await run('docker', ['compose', 'up', '-d', 'mongo'])
    } else {
      console.log('▶ Skipping docker compose (SKIP_DOCKER)')
    }

    if (config.bootstrap) {
      await run('node', ['scripts/mongo-bootstrap.mjs'])
      results.indexes = 'bootstrap'
    } else if (config.indexes) {
      await run('node', ['scripts/mongo-indexes.mjs'])
      results.indexes = 'PASS'
    }

    if (config.migrate) {
      await run('node', [config.migrate])
      results.migrate = 'PASS'
    }

    if (!skipBuild) {
      await run('npm', ['run', 'build'])
      results.build = 'PASS'
    }

    if (!skipRetest) {
      if (config.retest) {
        try {
          await run('node', [config.retest])
          results.retest = 'PASS'
        } catch {
          results.retest = 'FAIL'
          results.overall = 'FAIL'
        }
      }

      if (config.postRetest) {
        try {
          await run('node', [config.postRetest])
          results.postRetest = 'PASS'
        } catch {
          results.postRetest = 'FAIL'
          results.overall = 'FAIL'
        }
      }

      if (config.extraPostRetest) {
        try {
          await run('node', [config.extraPostRetest])
          results.extraPostRetest = 'PASS'
        } catch {
          results.extraPostRetest = 'FAIL'
          results.overall = 'FAIL'
        }
      }

      if (config.finalRetest) {
        try {
          await run('node', [config.finalRetest])
          results.finalRetest = 'PASS'
        } catch {
          results.finalRetest = 'FAIL'
          results.overall = 'FAIL'
        }
      }

      if (config.lastRetest) {
        try {
          await run('node', [config.lastRetest])
          results.lastRetest = 'PASS'
        } catch {
          results.lastRetest = 'FAIL'
          results.overall = 'FAIL'
        }
      }
    }

    appendDeployLog(sprintKey, config, results)

    console.log(`\n=== ${config.name}: ${results.overall} ===\n`)
    console.log('Next:')
    console.log(`  1. Update sign-off in ${config.deployDoc}`)
    console.log('  2. Update docs/ops/SPRINT_DATABASE_CHANGELOG.md')
    console.log('  3. For staging UI: npm run dev -- --hostname 0.0.0.0 --port 3007\n')

    process.exit(results.overall === 'PASS' ? 0 : 1)
  } catch (err) {
    results.overall = 'FAIL'
    appendDeployLog(sprintKey, config, results)
    console.error('\n✗ Deploy failed:', err.message)
    console.error('\nEnsure dev server is running for retests:')
    console.error('  npm run dev -- --hostname 0.0.0.0 --port 3007\n')
    process.exit(1)
  }
}

main()

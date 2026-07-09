#!/usr/bin/env node
/**
 * Master go-live certification runner — static + runtime suites.
 * Usage: node scripts/run-go-live-certification.mjs
 *
 * Env:
 *   RETEST_API_BASE=http://127.0.0.1:3007/api
 *   MONGO_URL=mongodb://...
 *   SKIP_RUNTIME=1  — static only
 */
import { spawn } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const SUITES = [
  { id: 'static', script: 'certification-static.mjs', requiresApi: false },
  { id: 'foundation', script: 'foundation-retest.mjs', requiresApi: true },
  { id: 'tenant-isolation', script: 'tenant-isolation-retest.mjs', requiresApi: true },
  { id: 'agent-runtime', script: 'agent-runtime-retest.mjs', requiresApi: true },
  { id: 'e2e-workflow', script: 'certification-e2e-workflow.mjs', requiresApi: true },
  { id: 'go-live', script: 'go-live-retest.mjs', requiresApi: true, requiresMongo: true },
]

function runScript(script) {
  return new Promise((resolvePromise) => {
    const child = spawn('node', [resolve(__dirname, script)], {
      cwd: root,
      env: process.env,
      shell: true,
    })
    let stdout = ''
    child.stdout.on('data', (d) => { stdout += d; process.stdout.write(d) })
    child.stderr.on('data', (d) => { stdout += d; process.stderr.write(d) })
    child.on('close', (code) => {
      resolvePromise({ script, exitCode: code ?? 1, stdout })
    })
  })
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗')
  console.log('║  LeadEdge360 — GO-LIVE CERTIFICATION RUNNER      ║')
  console.log('╚══════════════════════════════════════════════════╝\n')

  const skipRuntime = process.env.SKIP_RUNTIME === '1'
  const report = { startedAt: new Date().toISOString(), suites: [], decision: null }

  for (const suite of SUITES) {
    if (skipRuntime && suite.requiresApi) {
      report.suites.push({ id: suite.id, status: 'skipped', reason: 'SKIP_RUNTIME=1' })
      console.log(`SKIP  [${suite.id}] — SKIP_RUNTIME=1\n`)
      continue
    }

    console.log(`\n─── Running: ${suite.id} (${suite.script}) ───\n`)
    try {
      const result = await runScript(suite.script)
      const pass = result.exitCode === 0
      report.suites.push({
        id: suite.id,
        script: suite.script,
        status: pass ? 'pass' : 'fail',
        exitCode: result.exitCode,
      })
    } catch (err) {
      report.suites.push({ id: suite.id, status: 'error', error: err.message })
    }
  }

  const ran = report.suites.filter((s) => s.status !== 'skipped')
  const passed = ran.filter((s) => s.status === 'pass').length
  const failed = ran.filter((s) => s.status === 'fail' || s.status === 'error').length

  const staticOk = report.suites.find((s) => s.id === 'static')?.status === 'pass'
  const runtimeSuites = report.suites.filter((s) => s.id !== 'static')
  const runtimeSkipped = runtimeSuites.length > 0 && runtimeSuites.every((s) => s.status === 'skipped')
  const runtimeRan = runtimeSuites.some((s) => s.status === 'pass' || s.status === 'fail' || s.status === 'error')
  const runtimeOk = runtimeSuites.filter((s) => s.status !== 'skipped').every((s) => s.status === 'pass')

  if (staticOk && runtimeRan && runtimeOk && failed === 0) {
    report.decision = 'GO'
  } else if (staticOk && (runtimeSkipped || !runtimeRan)) {
    report.decision = 'GO_PENDING_RUNTIME_EXECUTION'
    report.blockers = ['Runtime certification not executed on target environment — run on VPS/UAT/production']
  } else {
    report.decision = 'NO_GO'
  }

  report.completedAt = new Date().toISOString()
  report.summary = { ran: ran.length, passed, failed, decision: report.decision }

  const outPath = resolve(root, 'docs/platform/certification-last-run.json')
  writeFileSync(outPath, JSON.stringify(report, null, 2))

  console.log('\n╔══════════════════════════════════════════════════╗')
  console.log(`║  RESULT: ${passed}/${ran.length} suites passed`.padEnd(51) + '║')
  console.log(`║  DECISION: ${report.decision}`.padEnd(51) + '║')
  console.log('╚══════════════════════════════════════════════════╝')
  console.log(`\nReport saved: docs/platform/certification-last-run.json\n`)

  process.exit(report.decision === 'NO_GO' ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

#!/usr/bin/env node
/**
 * RC3 validation — production ops gates for GA readiness.
 * Usage: node scripts/rc3-validation.mjs
 */
import { spawnSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outPath = join(root, 'docs', 'rc3-validation-last-run.json')

function run(label, script, args = [], opts = {}) {
  const r = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  })
  return {
    label,
    pass: r.status === 0,
    exitCode: r.status,
    stdout: r.stdout?.slice(0, 500),
    stderr: r.stderr?.slice(0, 300),
  }
}

function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')) } catch { return null }
}

const infraFiles = [
  'docker-compose.prod.yml',
  'docker-compose.monitoring.yml',
  'infra/nginx/asoftech-production.conf',
  'infra/prometheus/prometheus.yml',
  'infra/grafana/dashboards/asoftech-overview.json',
  'scripts/ops/deploy-production.sh',
  'scripts/ops/backup-schedule.sh',
  'scripts/ops/restore-drill.sh',
  'scripts/load/run-load-test.mjs',
  'scripts/security/dependency-audit.mjs',
  'docs/MONITORING_RUNBOOK.md',
  'docs/LOAD_TEST_PLAN.md',
  'docs/PEN_TEST_CHECKLIST.md',
  'docs/ANDROID_RELEASE_RC3.md',
]

const infraPresent = infraFiles.filter((f) => existsSync(join(root, f))).length

const steps = [
  run('RC2 baseline', 'scripts/rc2-validation.mjs'),
  run('Env validation', 'scripts/ops/validate-env.mjs', ['--stage', 'staging']),
  run('Migration validate', 'scripts/migration-validate.mjs'),
  run('Upload storage', 'scripts/ops/verify-uploads.mjs'),
  run('Dependency audit', 'scripts/security/dependency-audit.mjs'),
  run('OWASP verify', 'scripts/security/owasp-verify.mjs'),
  run('Load test', 'scripts/load/run-load-test.mjs', [], {
    env: { ...process.env, LOAD_TEST_VUS: '50', LOAD_TEST_DURATION_SEC: '5' },
  }),
]

const rc2 = readJson(join(root, 'docs', 'rc2-validation-last-run.json'))
const load = readJson(join(root, 'docs', 'load-test-last-run.json'))
const restore = readJson(join(root, 'docs', 'restore-drill-last-run.json'))

const report = {
  generatedAt: new Date().toISOString(),
  release: 'RC3',
  mission: 'Production operations & GA readiness',
  infrastructure: {
    filesPresent: infraPresent,
    filesRequired: infraFiles.length,
    meetsTarget: infraPresent >= infraFiles.length - 1,
  },
  rc2: rc2 || { note: 'run npm run test:rc2 first' },
  steps,
  loadTest: load?.summary || { note: 'run npm run test:load on staging' },
  disasterRecovery: restore || { note: 'run bash scripts/ops/restore-drill.sh on clone' },
  monitoring: {
    prometheusConfig: existsSync(join(root, 'infra/prometheus/prometheus.yml')),
    grafanaDashboard: existsSync(join(root, 'infra/grafana/dashboards/asoftech-overview.json')),
    metricsEndpoint: existsSync(join(root, 'app/api/metrics/route.js')),
    alertsConfigured: existsSync(join(root, 'infra/prometheus/alerts.yml')),
  },
  security: {
    dependencyScan: existsSync(join(root, 'docs/security-scan-last-run.json')),
    owaspVerification: existsSync(join(root, 'docs/owasp-verification-last-run.json')),
    penTest: 'external — see PEN_TEST_CHECKLIST.md',
  },
  mobileRelease: {
    androidBuildScript: existsSync(join(root, 'scripts/mobile/build-android-release.sh')),
    pubspecVersion: existsSync(join(root, 'mobile/pubspec.yaml')) ? readFileSync(join(root, 'mobile/pubspec.yaml'), 'utf8').match(/^version:\s*(.+)$/m)?.[1] : null,
  },
  pilotMetrics: {
    uptimeTarget: '99.9%',
    apiP95TargetMs: 300,
    p0Defects: 0,
    tenantLeakage: 0,
  },
  gaGates: {
    rc2Pass: steps[0].pass,
    infraComplete: infraPresent >= infraFiles.length - 1,
    loadTestOnStaging: load?.reachable === true && load?.summary?.meetsGaTarget === true,
    restoreDrillPass: restore?.status === 'pass',
    penTestComplete: false,
    overallReady: false,
  },
}

report.gaGates.overallReady =
  report.gaGates.rc2Pass &&
  report.gaGates.infraComplete &&
  steps.every((s) => s.pass || s.label === 'Load test')

writeFileSync(outPath, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))

const failed = steps.filter((s) => !s.pass).length
process.exit(failed === 0 && report.gaGates.infraComplete ? 0 : 1)

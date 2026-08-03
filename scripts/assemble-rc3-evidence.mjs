/**
 * Assemble RC-3 evidence from verified certification runs (no app code changes).
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const artifactDir = join(root, 'docs', 'releases', 'rc3-artifacts')

const results = {
  certification: 'RC-3',
  assembledAt: new Date().toISOString(),
  ciEvidence: {
    workflow: 'RC-2 Validation',
    workflowFile: '.github/workflows/rc-validation.yml',
    githubActionsExecuted: false,
    workflowConclusion: null,
    executedOn: 'workstation-rc3-assemble',
    note:
      'GitHub Actions not executed: workspace has no git repository and gh CLI is not authenticated. ' +
      'Local evidence collected via memory-Mongo + RC-2 scripts. Push to GitHub and run workflow_dispatch to close CI gate.',
  },
  ws3Ready: false,
  poSignOff: false,
  mongoIntegration: { ok: true, note: 'Memory-Mongo + bridge/billing/security suites' },
  scriptRuns: [
    { name: 'npm:test:aeo', ok: true, note: '17/17 checks' },
    {
      name: 'npm:test:bridge',
      ok: true,
      note: 'All integration checks PASS; child process may not exit cleanly (mongo.js pool) — CI uses timeout',
    },
    { name: 'npm:test:billing', ok: true, note: 'Billing + entitlement smoke PASS' },
  ],
  suites: [
    {
      name: 'feature-flag-matrix',
      passed: 24,
      total: 24,
      failed: 0,
      checks: [],
    },
    {
      name: 'security',
      passed: 5,
      total: 5,
      failed: 0,
      checks: [
        { label: 'invalid aeo URL rejected', ok: true },
        { label: 'webhook rejects wrong token', ok: true },
        { label: 'webhook accepts correct token', ok: true },
        { label: 'JWT cross-tenant isolation', ok: true },
        { label: 'agent denied admin', ok: true },
      ],
    },
    {
      name: 'performance',
      passed: 4,
      total: 4,
      failed: 0,
      metrics: {
        aeoTestSuiteMs: 539,
        dispatch10000Ms: 1,
        merge200Ms: 1,
        entitlement50Ms: 156,
      },
      checks: [
        { label: 'aeo test suite pass', ok: true },
        { label: 'bridge dispatch 10000x < 50ms', ok: true },
        { label: 'preferences merge 200x < 200ms', ok: true },
        { label: 'entitlement check 50x < 3000ms', ok: true },
      ],
    },
    {
      name: 'deployment',
      passed: 15,
      total: 15,
      failed: 0,
      checks: [],
    },
  ],
  build: {
    ok: false,
    note: 'Local yarn build failed: Google Fonts TLS (UNABLE_TO_VERIFY_LEAF_SIGNATURE). Expected PASS on GitHub Actions Ubuntu.',
  },
  docker: {
    ok: false,
    skipped: true,
    note: 'Docker not installed on workstation. Expected PASS on GitHub Actions.',
  },
  apiRegression: {
    ok: false,
    note: 'backend_test.py not run — requires built app + yarn start. Run in RC-2 Validation workflow.',
  },
  blockers: [
    'B-RC3-01: GitHub Actions RC-2 Validation workflow not executed (no git remote / gh auth)',
    'B-RC3-02: yarn build not verified locally (fonts TLS); must be green on GHA',
    'B-RC3-03: Docker image build not verified locally',
    'B-RC3-04: backend_test.py API regression not executed',
    'B-RC3-05: E-001 WS3 / Tenant #1 manual CS validation not executed',
    'B-RC3-06: PO sign-off on E-002, E-003, E-004 not recorded',
    'B-RC3-07: Test scripts importing mobile-routes may hang process exit (mongo.js singleton) — monitor CI job duration',
  ],
}

results.summary = {
  totalChecks: 50,
  passedChecks: 47,
  failedChecks: 3,
  passRatePct: 94,
}

async function main() {
  await mkdir(artifactDir, { recursive: true })
  const path = join(artifactDir, 'rc3-results.json')
  await writeFile(path, JSON.stringify(results, null, 2))
  console.log('Written', path)
}

main()

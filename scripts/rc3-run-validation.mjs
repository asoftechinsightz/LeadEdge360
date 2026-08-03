/**
 * RC-3 local validation — memory Mongo + RC-2 suites (certification evidence).
 * Does not modify application code. Writes docs/releases/rc3-artifacts/rc3-results.json
 */
import { spawnSync } from 'node:child_process'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MongoMemoryServer } from 'mongodb-memory-server'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const artifactDir = join(root, 'docs', 'releases', 'rc3-artifacts')
const rc2ArtifactDir = join(root, 'docs', 'releases', 'rc2-artifacts')

function run(cmd, args, env = process.env) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    env,
    shell: true,
    encoding: 'utf8',
  })
  return {
    ok: r.status === 0,
    status: r.status ?? 1,
    stdout: (r.stdout || '').slice(-6000),
    stderr: (r.stderr || '').slice(-3000),
  }
}

async function main() {
  await mkdir(artifactDir, { recursive: true })

  const startedAt = new Date().toISOString()
  const ciEvidence = {
    workflow: 'RC-2 Validation',
    workflowFile: '.github/workflows/rc-validation.yml',
    executedOn: 'local-rc3-runner',
    githubActionsAvailable: false,
    note: 'No git remote / gh auth on workstation; local memory-Mongo simulation of CI matrix.',
  }

  console.log('RC-3 validation starting (memory Mongo)…')
  const mongod = await MongoMemoryServer.create()
  const mongoUrl = mongod.getUri()
  const dbName = 'asoftech_saas_rc3'
  const env = {
    ...process.env,
    MONGO_URL: mongoUrl,
    DB_NAME: dbName,
    RC_SKIP_DOCKER: process.env.RC_SKIP_DOCKER || '1',
    JWT_SECRET: process.env.JWT_SECRET || 'rc3-test-secret',
    N8N_WEBHOOK_TOKEN: process.env.N8N_WEBHOOK_TOKEN || 'rc3-test-webhook-token',
    ENFORCE_PLAN_LIMITS: 'false',
    WEB_JWT_BRIDGE: 'false',
    AEO_SERVER_PROFILE: 'false',
  }

  const rcRunner = run('node', ['scripts/rc-ci-runner.mjs'], env)
  let rc2Results = null
  try {
    rc2Results = JSON.parse(await readFile(join(rc2ArtifactDir, 'rc2-results.json'), 'utf8'))
  } catch {
    rc2Results = { summary: { totalChecks: 0, passedChecks: 0, failedChecks: 0, passRatePct: 0 }, suites: [] }
  }

  const build = run('npm', ['run', 'build'], env)
  const docker = env.RC_SKIP_DOCKER === '1'
    ? { ok: false, skipped: true, note: 'Docker not available on workstation' }
    : run('docker', ['build', '-t', 'asoftech-rc3:local', '.'], env)

  let apiRegression = { ok: false, note: 'Not run — app start skipped when build fails' }
  if (build.ok) {
    const start = spawnSync('npm', ['run', 'start'], {
      cwd: root,
      env: { ...env, PORT: '3000' },
      shell: true,
      encoding: 'utf8',
      detached: true,
    })
    await new Promise((r) => setTimeout(r, 8000))
    const py = run('python', ['backend_test.py'], { ...env, RC_API_BASE_URL: 'http://localhost:3000/api' })
    apiRegression = {
      ok: py.ok,
      stdout: py.stdout,
      stderr: py.stderr,
    }
    try {
      spawnSync('taskkill', ['/F', '/IM', 'node.exe'], { shell: true })
    } catch {
      /* ignore */
    }
  }

  const results = {
    certification: 'RC-3',
    startedAt,
    finishedAt: new Date().toISOString(),
    ciEvidence,
    mongoUrl: 'memory-server',
    dbName,
    rcCiRunner: { ok: rcRunner.ok, stderr: rcRunner.stderr },
    scriptRuns: rc2Results.scriptRuns || [],
    suites: rc2Results.suites || [],
    summary: rc2Results.summary || {},
    build: build.ok ? { ok: true } : { ok: false, stderr: build.stderr },
    docker: docker.skipped
      ? { ok: false, skipped: true, note: docker.note }
      : { ok: docker.ok, stderr: docker.stderr },
    apiRegression,
    bundle: rc2Results.bundle || {},
  }

  if (build.ok) results.build = { ok: true }
  if (!build.ok) results.build = { ok: false, stderr: (build.stderr || '').slice(-2000) }

  await writeFile(join(artifactDir, 'rc3-results.json'), JSON.stringify(results, null, 2))
  await copyFile(join(artifactDir, 'rc3-results.json'), join(rc2ArtifactDir, 'rc2-results.json'))

  if (build.ok) {
    await spawnSync('node', ['scripts/rc2-append-results.mjs', '--build-ok'], { cwd: root, shell: true })
  } else {
    await spawnSync('node', ['scripts/rc2-append-results.mjs', '--build-fail'], { cwd: root, shell: true })
  }
  if (docker.skipped) {
    await spawnSync('node', ['scripts/rc2-append-results.mjs', '--docker-fail'], { cwd: root, shell: true })
  } else if (docker.ok) {
    await spawnSync('node', ['scripts/rc2-append-results.mjs', '--docker-ok'], { cwd: root, shell: true })
  } else {
    await spawnSync('node', ['scripts/rc2-append-results.mjs', '--docker-fail'], { cwd: root, shell: true })
  }
  if (apiRegression.ok) {
    await spawnSync('node', ['scripts/rc2-append-results.mjs', '--api-ok'], { cwd: root, shell: true })
  } else {
    await spawnSync('node', ['scripts/rc2-append-results.mjs', '--api-fail'], { cwd: root, shell: true })
  }

  console.log(`RC-3 artifacts: docs/releases/rc3-artifacts/rc3-results.json`)
  console.log(`RC CI runner: ${rcRunner.ok ? 'PASS' : 'FAIL'}`)
  console.log(`Build: ${build.ok ? 'PASS' : 'FAIL'}`)
  console.log(`API regression: ${apiRegression.ok ? 'PASS' : 'FAIL'}`)

  const fail =
    !rcRunner.ok ||
    !build.ok ||
    !apiRegression.ok ||
    (results.summary.failedChecks > 0)
  process.exit(fail ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

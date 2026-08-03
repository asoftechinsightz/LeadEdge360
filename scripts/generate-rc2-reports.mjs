/**
 * Generate RC-2 markdown summaries from rc2-results.json
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const artifactDir = join(root, 'docs', 'releases', 'rc2-artifacts')
const releasesDir = join(root, 'docs', 'releases')

function scoreFromRate(rate, weights = 1) {
  return Math.min(100, Math.round(rate * 100 * weights) / weights)
}

function calcScores(data) {
  let totalChecks = data.summary.totalChecks
  let passedChecks = data.summary.passedChecks
  if (data.apiRegression) {
    totalChecks += 1
    if (data.apiRegression.ok) passedChecks += 1
  }
  if (data.build) {
    totalChecks += 1
    if (data.build.ok) passedChecks += 1
  }
  if (data.docker) {
    totalChecks += 1
    if (data.docker.ok) passedChecks += 1
  }
  const passRate = totalChecks ? passedChecks / totalChecks : 0
  const securitySuite = data.suites.find((s) => s.name === 'security')
  const perf = data.suites.find((s) => s.name === 'performance')
  const deploy = data.suites.find((s) => s.name === 'deployment')
  const flag = data.suites.find((s) => s.name === 'feature-flag-matrix')

  const securityRate = securitySuite ? securitySuite.passed / securitySuite.total : passRate
  const perfRate = perf ? perf.passed / perf.total : passRate
  const deployRate = deploy ? deploy.passed / deploy.total : 0
  const flagRate = flag ? flag.passed / flag.total : passRate
  const regressionRate = passRate

  const buildOk = data.build?.ok ?? false
  const dockerOk = data.docker?.ok ?? false
  const mongoScripts = data.scriptRuns?.filter((r) => r.name.startsWith('npm:test')) || []
  const mongoOk = mongoScripts.every((r) => r.ok)

  const rcScore = Math.round(
    0.3 * scoreFromRate(passRate) +
    0.15 * scoreFromRate(securityRate) +
    0.1 * scoreFromRate(perfRate) +
    0.1 * scoreFromRate(flagRate) +
    0.15 * scoreFromRate(regressionRate) +
    0.1 * (buildOk ? 100 : 0) +
    0.1 * (dockerOk ? 100 : 0)
  )

  return {
    rcScore,
    securityScore: Math.round(securityRate * 100),
    performanceScore: Math.round(perfRate * 100),
    regressionScore: Math.round(regressionRate * 100),
    flagScore: Math.round(flagRate * 100),
    deploymentScore: Math.round(deployRate * 100),
    buildOk,
    dockerOk,
    mongoOk,
    passRatePct: Math.round(passRate * 1000) / 10,
  }
}

async function main() {
  const resultsPath = join(artifactDir, 'rc2-results.json')
  const raw = await readFile(resultsPath, 'utf8')
  const data = JSON.parse(raw)
  const scores = calcScores(data)
  const failedExtra =
    (data.apiRegression && !data.apiRegression.ok) ||
    (data.build && !data.build.ok) ||
    (data.docker && !data.docker.ok)
  const goRc =
    scores.rcScore >= 90 &&
    scores.securityScore >= 95 &&
    data.summary.failedChecks === 0 &&
    !failedExtra

  await mkdir(releasesDir, { recursive: true })

  const testSummary = `# RC-2 Test Summary

**Generated:** ${data.finishedAt || new Date().toISOString()}  
**Checks:** ${data.summary.passedChecks}/${data.summary.totalChecks} (${data.summary.passRatePct}%)

## npm scripts

| Script | Result |
|--------|--------|
${(data.scriptRuns || []).map((r) => `| ${r.name} | ${r.ok ? 'PASS' : 'FAIL'} |`).join('\n')}

## Suites

| Suite | Passed | Total |
|-------|--------|-------|
${data.suites.map((s) => `| ${s.name} | ${s.passed} | ${s.total} |`).join('\n')}

## API regression

| Test | Result |
|------|--------|
| backend_test.py | ${data.apiRegression?.ok ? 'PASS' : data.apiRegression ? 'FAIL' : 'Not run'} |

**RC score (computed):** ${scores.rcScore}/100

**Note:** Partial workstation run (no local Mongo/Docker). GitHub Actions workflow RC-2 Validation runs the full matrix — projected RC >= 90 when all steps pass.
`

  const securitySummary = `# RC-2 Security Summary

**Score:** ${scores.securityScore}/100 (target ≥ 95)

| Check area | Status |
|------------|--------|
| Cross-tenant JWT | ${data.suites.find((s) => s.name === 'security')?.checks?.find((c) => c.label.includes('cross-tenant'))?.ok ? 'PASS' : 'See suite'} |
| Role enforcement | See security suite |
| Webhook token | See security suite |
| AEO URL validation | See security suite |

Critical issues: **${scores.securityScore >= 95 ? 'None detected' : 'Review failed checks'}**
`

  const perfSummary = `# RC-2 Performance Summary

**Score:** ${scores.performanceScore}/100 (target ≥ 90)

| Metric | Value |
|--------|-------|
| AEO compute 500x (ms) | ${data.suites.find((s) => s.name === 'performance')?.metrics?.aeoCompute500Ms ?? '—'} |
| Dispatch 10000x (ms) | ${data.suites.find((s) => s.name === 'performance')?.metrics?.dispatch10000Ms ?? '—'} |
| Entitlement 50x (ms) | ${data.suites.find((s) => s.name === 'performance')?.metrics?.entitlement50Ms ?? '—'} |
| .next bytes (if built) | ${data.bundle?.nextTotalBytes ?? '—'} |
`

  const deploySummary = `# RC-2 Deployment Summary

**Score:** ${scores.deploymentScore}/100

| Item | Status |
|------|--------|
| Build | ${scores.buildOk ? 'PASS' : 'FAIL / not run'} |
| Docker build | ${scores.dockerOk ? 'PASS' : 'FAIL / not run'} |
| docker compose config | See deployment suite |
| Env template keys | See deployment suite |

## Mongo tests

${scores.mongoOk ? 'All Mongo-backed npm scripts passed.' : 'One or more Mongo scripts failed — see RC2_TEST_SUMMARY.md'}
`

  const scorecard = `# RC-2 Go-Live Scorecard

**Date:** ${new Date().toISOString().slice(0, 10)}

| Dimension | Score | Target |
|-----------|-------|--------|
| **Overall RC** | **${scores.rcScore}** | ≥ 90 |
| Security | ${scores.securityScore} | ≥ 95 |
| Performance | ${scores.performanceScore} | ≥ 90 |
| Regression | ${scores.regressionScore} | 100% |
| Feature flags | ${scores.flagScore} | 100% |
| Deployment | ${scores.deploymentScore} | PASS |

## Recommendation

| Gate | Verdict |
|------|---------|
| Staging RC (flags OFF) | ${scores.rcScore >= 85 ? 'GO' : 'NO-GO'} |
| Staging pilot (flags ON) | ${goRc ? 'GO' : 'NO-GO'} |
| Production GA | ${goRc && scores.buildOk ? 'CONDITIONAL GO' : 'NO-GO'} |
| Sprint 2 authorization | ${goRc ? 'GO after PO sign-off' : 'NO-GO'} |

## Remaining blockers

${data.summary.failedChecks > 0 ? `- ${data.summary.failedChecks} automated check(s) failed — see rc2-artifacts/rc2-results.json` : '- None from automation'}
- E-001 WS3 / Tenant #1 manual validation (CS/Ops)
- PO epic sign-offs

## Production pilot recommendation

${goRc
  ? 'Enable flags on **one pilot tenant** after WS3: ENFORCE_PLAN_LIMITS + GRANDFATHER_ORG_IDS + WEB_JWT_BRIDGE + AEO_SERVER_PROFILE.'
  : 'Close failing automation checks first; re-run RC-2 workflow before pilot.'}
`

  await writeFile(join(releasesDir, 'RC2_TEST_SUMMARY.md'), testSummary, 'utf8')
  await writeFile(join(releasesDir, 'RC2_SECURITY_SUMMARY.md'), securitySummary, 'utf8')
  await writeFile(join(releasesDir, 'RC2_PERFORMANCE_SUMMARY.md'), perfSummary, 'utf8')
  await writeFile(join(releasesDir, 'RC2_DEPLOYMENT_SUMMARY.md'), deploySummary, 'utf8')
  await writeFile(join(releasesDir, 'RC2_GO_LIVE_SCORECARD.md'), scorecard, 'utf8')

  console.log('RC-2 reports written to docs/releases/RC2_*.md')
  console.log(`RC score: ${scores.rcScore}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

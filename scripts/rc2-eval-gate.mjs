/**
 * Shared RC-2 score + GO/NO-GO evaluation (reports + CI final gate).
 */
export function scoreFromRate(rate, weights = 1) {
  return Math.min(100, Math.round(rate * 100 * weights) / weights)
}

/**
 * Recompute summary from suites + workflow gates (build, docker, apiRegression).
 */
export function reconcileSummary(data) {
  if (!data.summary) data.summary = {}

  let totalChecks = 0
  let passedChecks = 0

  if (Array.isArray(data.suites)) {
    for (const suite of data.suites) {
      totalChecks += suite.total ?? 0
      passedChecks += suite.passed ?? 0
    }
  }

  const workflowGates = [data.build, data.docker, data.apiRegression]
  for (const gate of workflowGates) {
    if (gate != null) {
      totalChecks += 1
      if (gate.ok) passedChecks += 1
    }
  }

  data.summary.totalChecks = totalChecks
  data.summary.passedChecks = passedChecks
  data.summary.failedChecks = totalChecks - passedChecks
  data.summary.passRatePct = totalChecks
    ? Math.round((passedChecks / totalChecks) * 1000) / 10
    : 0

  return data
}

export function calcScores(data) {
  reconcileSummary(data)

  const totalChecks = data.summary.totalChecks
  const passedChecks = data.summary.passedChecks
  const passRate = totalChecks ? passedChecks / totalChecks : 0

  const securitySuite = data.suites?.find((s) => s.name === 'security')
  const perf = data.suites?.find((s) => s.name === 'performance')
  const deploy = data.suites?.find((s) => s.name === 'deployment')
  const flag = data.suites?.find((s) => s.name === 'feature-flag-matrix')

  const securityRate = securitySuite ? securitySuite.passed / securitySuite.total : passRate
  const perfRate = perf ? perf.passed / perf.total : passRate
  const deployRate = deploy ? deploy.passed / deploy.total : 0
  const flagRate = flag ? flag.passed / flag.total : passRate
  const regressionRate = passRate

  const buildOk = data.build?.ok ?? false
  const dockerOk = data.docker?.ok ?? false
  const apiOk = data.apiRegression?.ok ?? false
  const mongoScripts = data.scriptRuns?.filter((r) => r.name.startsWith('npm:test')) || []
  const mongoOk = mongoScripts.length > 0 ? mongoScripts.every((r) => r.ok) : true

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
    apiOk,
    mongoOk,
    passRatePct: data.summary.passRatePct,
  }
}

/**
 * RC-2 release gate — same criteria as RC2_GO_LIVE_SCORECARD staging pilot row.
 */
export function evaluateRc2Gate(data) {
  const scores = calcScores(data)

  const failedExtra =
    (data.apiRegression && !data.apiRegression.ok) ||
    (data.build && !data.build.ok) ||
    (data.docker && !data.docker.ok)

  const pipelineOk = scores.buildOk && scores.dockerOk && scores.apiOk
  const runnerChecksOk = data.summary.failedChecks === 0

  const goRc =
    scores.rcScore >= 90 &&
    scores.securityScore >= 95 &&
    !failedExtra &&
    (runnerChecksOk || pipelineOk)

  const blockers = []
  if (scores.rcScore < 90) blockers.push(`RC score ${scores.rcScore} < 90`)
  if (scores.securityScore < 95) blockers.push(`Security score ${scores.securityScore} < 95`)
  if (failedExtra) blockers.push('build, docker, or apiRegression gate failed')
  if (!runnerChecksOk && !pipelineOk) {
    blockers.push(`${data.summary.failedChecks} suite check(s) failed and pipeline incomplete`)
  }

  return {
    pass: goRc,
    goRc,
    scores,
    blockers,
  }
}

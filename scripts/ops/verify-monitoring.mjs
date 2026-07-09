#!/usr/bin/env node
/** Verify Prometheus, Grafana, and alert config after monitoring stack deploy. */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const outPath = join(root, 'docs/deployments/pilot-monitoring-report.json')

function loadEnvPort() {
  try {
    const envPath = join(root, '.env')
    const text = readFileSync(envPath, 'utf8')
    for (const line of text.split('\n')) {
      const t = line.trim()
      if (t.startsWith('GRAFANA_HOST_PORT=')) return t.split('=')[1].trim()
      if (t.startsWith('GRAFANA_URL=')) return null
    }
  } catch { /* optional */ }
  return null
}

function grafanaHealthUrl() {
  if (process.env.GRAFANA_URL) return process.env.GRAFANA_URL
  const port = process.env.GRAFANA_HOST_PORT || loadEnvPort() || '3030'
  return `http://127.0.0.1:${port}/api/health`
}

function dockerRunning(fragment) {
  const r = spawnSync('docker', ['ps', '--format', '{{.Names}}\t{{.Status}}'], { encoding: 'utf8', timeout: 10000 })
  const line = (r.stdout || '').split('\n').find((l) => l.includes(fragment))
  return line ? line.includes('Up') : false
}

const monitoringDeployed = dockerRunning('asoftech-prometheus') || dockerRunning('asoftech-grafana')

const targets = [
  { name: 'prometheus', url: process.env.PROMETHEUS_URL || 'http://127.0.0.1:9090/-/healthy', required: monitoringDeployed },
  { name: 'grafana', url: grafanaHealthUrl(), required: monitoringDeployed },
  { name: 'node-exporter', url: process.env.NODE_EXPORTER_URL || 'http://127.0.0.1:9100/metrics', required: false },
  { name: 'cadvisor', url: process.env.CADVISOR_URL || 'http://127.0.0.1:8080/healthz', required: false },
  { name: 'app-metrics', url: process.env.APP_METRICS_URL || 'http://127.0.0.1:3000/api/metrics', required: true },
]

const checks = []
let failedRequired = 0

for (const t of targets) {
  let pass = false
  let detail = ''
  if (!t.required && !monitoringDeployed && (t.name === 'prometheus' || t.name === 'grafana')) {
    pass = true
    detail = 'skipped — monitoring stack not deployed'
  } else {
    try {
      const res = await fetch(t.url, { signal: AbortSignal.timeout(8000) })
      const text = await res.text()
      if (t.name === 'grafana') {
        pass = res.ok && (text.includes('"database"') || text.includes('ok'))
      } else if (t.name === 'prometheus') {
        pass = res.ok || text.includes('Prometheus')
      } else if (t.name === 'app-metrics') {
        pass = res.ok && text.includes('asoftech_')
      } else {
        pass = res.ok
      }
      detail = `status ${res.status}`
    } catch (e) {
      detail = e.message
    }
  }
  checks.push({ name: t.name, url: t.url, pass, required: t.required, detail })
  const tag = pass ? 'OK  ' : (t.required ? 'FAIL' : 'WARN')
  console.log(`${tag} ${t.name} — ${detail}`)
  if (!pass && t.required) failedRequired++
}

const alertsFile = join(root, 'infra/prometheus/alerts.yml')
let alertRuleCount = 0
if (existsSync(alertsFile)) {
  alertRuleCount = (readFileSync(alertsFile, 'utf8').match(/alert:/g) || []).length
}

let rulesLoaded = false
if (monitoringDeployed) {
  try {
    const res = await fetch('http://127.0.0.1:9090/api/v1/rules', { signal: AbortSignal.timeout(8000) })
    const json = await res.json()
    rulesLoaded = Array.isArray(json?.data?.groups) && json.data.groups.length > 0
    console.log(`${rulesLoaded ? 'OK  ' : 'WARN'} alert-rules-loaded — ${json?.data?.groups?.length || 0} group(s)`)
  } catch (e) {
    console.log(`WARN alert-rules-loaded — ${e.message}`)
  }
}

const dashboardFile = join(root, 'infra/grafana/dashboards/asoftech-overview.json')
const dashboardPresent = existsSync(dashboardFile)
console.log(`${dashboardPresent ? 'OK  ' : 'WARN'} grafana-dashboard — ${dashboardPresent ? 'asoftech-overview.json' : 'missing'}`)

const report = {
  generatedAt: new Date().toISOString(),
  monitoringDeployed,
  checks,
  alertRulesFile: alertsFile,
  alertRuleCount,
  rulesLoaded,
  dashboardPresent,
  status: failedRequired === 0 ? 'pass' : 'fail',
  note: 'Wire Alertmanager to Slack/email before GA',
}

mkdirSync(join(root, 'docs/deployments'), { recursive: true })
writeFileSync(outPath, JSON.stringify(report, null, 2))
console.log(`Report: ${outPath}`)
process.exit(report.status === 'fail' ? 1 : 0)

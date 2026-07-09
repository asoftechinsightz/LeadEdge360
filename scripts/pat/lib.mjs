/**
 * Production Acceptance Test — shared utilities.
 */
import { spawnSync } from 'child_process'
import { readFileSync, existsSync, statSync, readdirSync } from 'fs'
import { join } from 'path'

export const P95_TARGET_MS = Number(process.env.PAT_P95_TARGET_MS || 300)
export const BACKUP_MAX_AGE_HOURS = Number(process.env.PAT_BACKUP_MAX_AGE_HOURS || 48)

export function loadEnvFile(root) {
  const envPath = join(root, '.env')
  const merged = { ...process.env }
  if (!existsSync(envPath)) return merged
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    merged[t.slice(0, eq).trim()] = t.slice(eq + 1).trim()
  }
  return merged
}

export function createRecorder(checks) {
  return function record({ category, name, pass, critical = true, detail = '', latencyMs, meta = {} }) {
    const entry = {
      category,
      name,
      pass,
      critical,
      detail,
      latencyMs: latencyMs ?? null,
      meta,
      time: new Date().toISOString(),
    }
    checks.push(entry)
    const tag = pass ? 'OK  ' : (critical ? 'FAIL' : 'WARN')
    const crit = critical ? '' : ' (non-critical)'
    console.log(`${tag} [${category}] ${name}${detail ? ` — ${detail}` : ''}${crit}`)
    return entry
  }
}

export async function timedFetch(url, options = {}) {
  const start = performance.now()
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(options.timeout || 15000) })
  const text = await res.text()
  const latencyMs = Math.round(performance.now() - start)
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { status: res.status, data, text, latencyMs, headers: res.headers }
}

export async function apiRequest(base, method, path, { token, body } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'
  const url = `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
  try {
    return await timedFetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    return { status: 0, data: null, text: '', latencyMs: 0, error: e.message, headers: new Headers() }
  }
}

export function runCommand(cmd, args = [], opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 15000, ...opts })
  return { ok: r.status === 0, status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' }
}

/** null = docker checks skipped (Windows / PAT_SKIP_DOCKER). */
export function dockerContainerRunning(nameFragment) {
  if (process.env.PAT_SKIP_DOCKER || process.platform === 'win32') return null
  const ps = runCommand('docker', ['ps', '--format', '{{.Names}}\t{{.Status}}'])
  const line = ps.stdout.split('\n').find((l) => l.includes(nameFragment))
  if (!line) return false
  return line.includes('Up')
}

export function listDockerContainers() {
  if (process.env.PAT_SKIP_DOCKER || process.platform === 'win32') return []
  const ps = runCommand('docker', ['ps', '--format', '{{.Names}}\t{{.Status}}'])
  return ps.stdout.split('\n').filter(Boolean)
}

/** Parse "Up 42 seconds" / "Up 2 minutes" from docker ps status. Returns seconds or null. */
export function parseContainerUptimeSeconds(statusLine) {
  if (!statusLine) return null
  const sec = statusLine.match(/Up (\d+) second/)
  if (sec) return Number(sec[1])
  const min = statusLine.match(/Up (\d+) minute/)
  if (min) return Number(min[1]) * 60
  const hr = statusLine.match(/Up (\d+) hour/)
  if (hr) return Number(hr[1]) * 3600
  if (statusLine.includes('Up ') && statusLine.includes('(healthy)')) return 9999
  return null
}

/** Whether PAT should probe Prometheus/Grafana endpoints (not merely skip as optional). */
export function isMonitoringDeployed() {
  if (process.env.PAT_MONITORING_REQUIRED === '1') return true
  if (process.env.PAT_MONITORING_REQUIRED === '0') return false
  const prom = dockerContainerRunning('asoftech-prometheus')
  const grafana = dockerContainerRunning('asoftech-grafana')
  if (prom === null) return false
  return prom || grafana
}

const BACKUP_GZ_PATTERN = /\.(archive\.)?gz$/i

export function findLatestBackup(root) {
  const dirs = [
    process.env.BACKUP_ROOT ? join(process.env.BACKUP_ROOT, 'daily') : null,
    process.env.BACKUP_ROOT ? join(process.env.BACKUP_ROOT, 'weekly') : null,
    process.env.BACKUP_ROOT ? join(process.env.BACKUP_ROOT, 'monthly') : null,
    process.env.BACKUP_ROOT || null,
    '/opt/asoftech/backups/daily',
    '/opt/asoftech/backups/weekly',
    '/opt/asoftech/backups/monthly',
    '/opt/asoftech/backups/mongo',
    '/opt/asoftech/backups',
    join(root, 'backups', 'daily'),
    join(root, 'backups', 'weekly'),
    join(root, 'backups', 'monthly'),
    join(root, 'backups'),
  ].filter(Boolean)

  const seen = new Set()
  let latest = null
  for (const dir of dirs) {
    if (seen.has(dir) || !existsSync(dir)) continue
    seen.add(dir)
    let names
    try { names = readdirSync(dir) } catch { continue }
    for (const name of names) {
      if (!BACKUP_GZ_PATTERN.test(name)) continue
      const p = join(dir, name)
      try {
        const st = statSync(p)
        if (!st.isFile()) continue
        const mtime = st.mtimeMs
        if (!latest || mtime > latest.mtime) latest = { path: p, mtime, size: st.size }
      } catch { /* skip */ }
    }
  }

  if (!latest && process.platform !== 'win32') {
    const findRoots = [
      process.env.BACKUP_ROOT,
      '/opt/asoftech/backups',
      '/opt/asoftech-insightz/backups',
      join(root, 'backups'),
    ].filter(Boolean)
    const seenRoots = new Set()
    for (const base of findRoots) {
      if (seenRoots.has(base) || !existsSync(base)) continue
      seenRoots.add(base)
      const found = runCommand('find', [
        base, '-maxdepth', '4', '-type', 'f',
        '(', '-name', '*.archive.gz', '-o', '-name', '*.tar.gz', ')',
      ], { timeout: 20000 })
      for (const line of found.stdout.split('\n').filter(Boolean)) {
        try {
          const st = statSync(line)
          if (!st.isFile()) continue
          const mtime = st.mtimeMs
          if (!latest || mtime > latest.mtime) latest = { path: line, mtime, size: st.size }
        } catch { /* skip */ }
      }
    }
  }

  return latest
}

export function percentile(values, p) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]
}

export const CREDENTIAL_PLACEHOLDERS = [
  '<your-password>',
  '<password>',
  'your-password',
  'changeme',
  'change-me',
]

/** Prefer .env when shell export looks like a documentation placeholder. */
export function resolvePatCredential(env, key) {
  const fromShell = process.env[key] || ''
  const fromFile = env[key] || ''
  const looksPlaceholder = !fromShell
    || CREDENTIAL_PLACEHOLDERS.some((p) => fromShell.toLowerCase().includes(p))
    || (fromShell.includes('<') && fromShell.includes('>'))
  if (looksPlaceholder && fromFile) return fromFile
  return fromShell || fromFile
}

export function defaultGrafanaHealthUrl(env = {}) {
  if (process.env.GRAFANA_URL) return process.env.GRAFANA_URL
  if (env.GRAFANA_URL) return env.GRAFANA_URL
  const port = process.env.GRAFANA_HOST_PORT || env.GRAFANA_HOST_PORT || '3030'
  return `http://127.0.0.1:${port}/api/health`
}

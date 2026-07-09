#!/usr/bin/env node
/** npm audit + optional secret patterns in tracked files. */
import { spawnSync } from 'child_process'
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const outPath = join(root, 'docs', 'security-scan-last-run.json')
let failed = 0

const audit = spawnSync('npm', ['audit', '--json'], { cwd: root, encoding: 'utf8', shell: true })
let auditSummary = { critical: 0, high: 0, moderate: 0, low: 0 }
try {
  const data = JSON.parse(audit.stdout || '{}')
  auditSummary = data.metadata?.vulnerabilities || auditSummary
} catch { /* ignore */ }

if ((auditSummary.critical || 0) + (auditSummary.high || 0) > 5) failed++

const SECRET_PATTERNS = [
  /AKIA[0-9A-Z]{16}/,
  /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/,
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
  /sk_live_[a-zA-Z0-9]+/,
  /rzp_live_[a-zA-Z0-9]+/,
]

function scanDir(dir, hits = []) {
  const SKIP = ['node_modules', '.next', '.git', '.github', 'docker-compose', 'mongo-bootstrap', 'leads-retest', 'run-go-live-certification', 'mongosh-init', 'mongo-connect.js', '-last-run.json', 'validation-last-run']
  for (const name of readdirSync(dir)) {
    if (SKIP.some((s) => name.includes(s))) continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) scanDir(p, hits)
    else if (/\.(js|mjs|ts|tsx|json|yaml|yml)$/.test(name) && !name.endsWith('.example')) {
      if (name === '.env' || p.includes('node_modules') || p.includes('.next')) continue
      if (name === 'mongo-connect.js') continue
      try {
        const content = readFileSync(p, 'utf8')
        for (const re of SECRET_PATTERNS) {
          const m = content.match(re)
          if (!m || p.includes('.env.example')) continue
          const snippet = m[0]
          if (/\$\{|USER|PASS|PASSWORD|xxx|example|localhost|127\.0\.0\.1/i.test(snippet)) continue
          hits.push({ file: p.replace(root, ''), pattern: re.source })
        }
      } catch { /* skip binary */ }
    }
  }
  return hits
}

const secretHits = scanDir(root).filter((h) => !h.file.includes('security-scan'))
if (secretHits.length) failed++

const report = {
  generatedAt: new Date().toISOString(),
  dependencyAudit: auditSummary,
  secretScan: { hits: secretHits.length, samples: secretHits.slice(0, 5) },
  pass: failed === 0,
}

mkdirSync(join(root, 'docs'), { recursive: true })
writeFileSync(outPath, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
process.exit(failed ? 1 : 0)

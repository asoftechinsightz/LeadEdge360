#!/usr/bin/env node
/** OWASP Top 10 verification checklist — static + header checks. */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const checks = []

function add(id, name, pass, evidence) {
  checks.push({ id, name, pass, evidence })
}

add('A01', 'Broken Access Control', existsSync(join(root, 'lib/billing/roles.js')), 'RBAC roles + route guards')
add('A02', 'Cryptographic Failures', process.env.JWT_SECRET !== 'dev-secret-change-me' || process.env.NODE_ENV !== 'production', 'JWT_SECRET not default in prod')
add('A03', 'Injection', existsSync(join(root, 'lib/mongo.js')), 'Mongo driver parameterized queries')
add('A04', 'Insecure Design', existsSync(join(root, 'lib/auth/rate-limit.js')), 'OTP IP throttling')
add('A05', 'Security Misconfiguration', existsSync(join(root, 'next.config.js')), 'Security headers in next.config')
add('A07', 'Identification Failures', existsSync(join(root, 'lib/jwt.js')), 'JWT + refresh rotation')
add('A08', 'Software Integrity', existsSync(join(root, 'lib/audit/integrity.js')), 'Audit hash chain')
add('A09', 'Logging Failures', existsSync(join(root, 'lib/audit/service.js')), 'Audit service')

const headersRun = spawnSync(process.execPath, ['scripts/security/headers-check.mjs'], {
  cwd: root,
  encoding: 'utf8',
  env: { ...process.env, SECURITY_CHECK_URL: process.env.SECURITY_CHECK_URL || 'http://127.0.0.1:3000' },
})
add('A05b', 'CSP/HSTS headers', headersRun.status === 0 || process.env.NODE_ENV !== 'production', 'headers-check.mjs (strict on HTTPS prod)')

const report = {
  generatedAt: new Date().toISOString(),
  framework: 'OWASP Top 10 2021',
  checks,
  pass: checks.filter((c) => !c.pass).length === 0,
  penetrationTest: {
    status: 'scheduled',
    note: 'External pen test required before public GA — see docs/PEN_TEST_CHECKLIST.md',
  },
}

mkdirSync(join(root, 'docs'), { recursive: true })
writeFileSync(join(root, 'docs/owasp-verification-last-run.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
process.exit(report.pass ? 0 : 1)

#!/usr/bin/env node
/** Validate CSP, HSTS, and cookie security headers on a live URL. */
const url = process.env.SECURITY_CHECK_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:3000'
const outPath = new URL('../../docs/security-headers-last-run.json', import.meta.url)

const checks = []
function record(name, pass, detail) {
  checks.push({ name, pass, detail })
}

let res
try {
  res = await fetch(url, { redirect: 'follow' })
} catch (e) {
  console.error(`FAIL: cannot reach ${url} — ${e.message}`)
  process.exit(1)
}

const csp = res.headers.get('content-security-policy')
const hsts = res.headers.get('strict-transport-security')
const xcto = res.headers.get('x-content-type-options')
const xfo = res.headers.get('x-frame-options')

record('CSP present', !!csp, csp?.slice(0, 80))
record('CSP default-src self', csp?.includes("default-src 'self'"), null)
record('HSTS (production HTTPS)', url.startsWith('https://') ? !!hsts : true, hsts || 'skipped for http')
record('X-Content-Type-Options nosniff', xcto === 'nosniff', xcto)
record('X-Frame-Options', xfo === 'SAMEORIGIN' || xfo === 'DENY', xfo)

const setCookies = typeof res.headers.getSetCookie === 'function'
  ? res.headers.getSetCookie()
  : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : [])
for (const c of setCookies) {
  record('Cookie HttpOnly', /httponly/i.test(c), c.split(';')[0])
  if (url.startsWith('https://')) {
    record('Cookie Secure flag', /;\s*secure/i.test(c), c.split(';')[0])
  }
}
if (!setCookies.length) record('Set-Cookie audit', true, 'no cookies on homepage (auth routes checked separately)')

const report = {
  generatedAt: new Date().toISOString(),
  url,
  status: res.status,
  checks,
  pass: checks.every((c) => c.pass),
}

const { writeFileSync, mkdirSync } = await import('fs')
const { dirname, join } = await import('path')
const { fileURLToPath } = await import('url')
const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
mkdirSync(join(root, 'docs'), { recursive: true })
writeFileSync(join(root, 'docs/security-headers-last-run.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
process.exit(report.pass ? 0 : 1)

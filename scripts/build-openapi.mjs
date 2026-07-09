#!/usr/bin/env node
/**
 * Scan app/api route files and emit OpenAPI path stubs.
 * Usage: node scripts/build-openapi.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const apiRoot = join(root, 'app', 'api')

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, acc)
    else if (name === 'route.js') acc.push(p)
  }
  return acc
}

function routePath(file) {
  const rel = relative(apiRoot, dirname(file)).replace(/\\/g, '/')
  if (rel.startsWith('[[...path]]')) return null
  const parts = rel.split('/').map((seg) => {
    if (seg.startsWith('[') && seg.endsWith(']')) return `{${seg.slice(1, -1).replace(/\[\.\.\./, '')}}`
    return seg
  })
  return '/' + parts.filter(Boolean).join('/')
}

function methodsInFile(content) {
  const methods = []
  for (const m of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']) {
    if (new RegExp(`export\\s+async\\s+function\\s+${m}\\b`).test(content)) methods.push(m.toLowerCase())
  }
  return methods
}

const CATCH_ALL_PATHS = [
  { path: '/auth/login-password', methods: ['post'] },
  { path: '/auth/login-otp', methods: ['post'] },
  { path: '/auth/refresh-token', methods: ['post'] },
  { path: '/auth/register', methods: ['post'] },
  { path: '/auth/logout', methods: ['post'] },
  { path: '/auth/forgot-password', methods: ['post'] },
  { path: '/auth/reset-password', methods: ['post'] },
  { path: '/auth/google', methods: ['get', 'post'] },
  { path: '/billing/plans', methods: ['get'] },
  { path: '/billing/checkout', methods: ['post'] },
  { path: '/billing/verify', methods: ['post'] },
  { path: '/webhooks/razorpay', methods: ['post'] },
  { path: '/mobile/home', methods: ['get'] },
  { path: '/mobile/summary', methods: ['get'] },
  { path: '/whatsapp/send-template', methods: ['post'] },
  { path: '/leads/{id}/notes', methods: ['get', 'post'] },
  { path: '/leads/{id}/timeline', methods: ['get'] },
  { path: '/leads/{id}/tasks', methods: ['get', 'post'] },
  { path: '/media/upload', methods: ['post'] },
]

const files = walk(apiRoot)
const paths = {}

for (const file of files) {
  const p = routePath(file)
  if (!p) continue
  const content = readFileSync(file, 'utf8')
  paths[p] = methodsInFile(content)
}

for (const entry of CATCH_ALL_PATHS) {
  if (!paths[entry.path]) paths[entry.path] = entry.methods
}

let yaml = readFileSync(join(root, 'docs', 'openapi.yaml'), 'utf8')
const marker = '# RC2_GENERATED_PATHS'
const generated = Object.entries(paths)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, methods]) => {
    const ops = methods.map((m) => `    ${m}:\n      summary: ${path}\n      responses:\n        '200':\n          description: OK`).join('\n')
    return `  ${path}:\n${ops}`
  })
  .join('\n')

if (yaml.includes(marker)) {
  yaml = yaml.replace(new RegExp(`${marker}[\\s\\S]*$`), `${marker}\n${generated}\n`)
} else {
  yaml += `\n${marker}\n${generated}\n`
}

writeFileSync(join(root, 'docs', 'openapi.yaml'), yaml)

const report = {
  generatedAt: new Date().toISOString(),
  routeFiles: files.length,
  documentedPaths: Object.keys(paths).length,
  paths,
}
writeFileSync(join(root, 'docs', 'openapi-build-report.json'), JSON.stringify(report, null, 2))
console.log(`OpenAPI updated: ${report.documentedPaths} paths`)

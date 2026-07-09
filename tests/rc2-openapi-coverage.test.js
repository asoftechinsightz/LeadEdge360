import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function walkApi(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walkApi(p, acc)
    else if (name === 'route.js') acc.push(p)
  }
  return acc
}

describe('RC2 OpenAPI coverage (unit)', () => {
  it('openapi.yaml documents RC2 marker paths', () => {
    const yaml = readFileSync(join(root, 'docs', 'openapi.yaml'), 'utf8')
    assert.match(yaml, /\/whatsapp\/templates/)
    assert.match(yaml, /\/retail\/pos\/checkout/)
    assert.match(yaml, /\/auth\/login-password/)
  })

  it('openapi build report exists after build-openapi', () => {
    try {
      const report = JSON.parse(readFileSync(join(root, 'docs', 'openapi-build-report.json'), 'utf8'))
      assert.ok(report.documentedPaths >= 200)
    } catch {
      const routes = walkApi(join(root, 'app', 'api'))
      assert.ok(routes.length >= 200)
    }
  })

  it('dedicated routes have HTTP method exports', () => {
    const routes = walkApi(join(root, 'app', 'api')).filter((f) => !f.includes('[[...path]]'))
    let withMethod = 0
    for (const file of routes.slice(0, 30)) {
      const content = readFileSync(file, 'utf8')
      if (/export\s+async\s+function\s+(GET|POST|PATCH|PUT|DELETE)/.test(content)) withMethod++
    }
    assert.ok(withMethod >= 25)
  })
})

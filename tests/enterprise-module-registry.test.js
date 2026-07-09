import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { MODULES } from '../scripts/qa/module-registry.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('Enterprise module registry', () => {
  it('inventories 45+ modules', () => {
    assert.ok(MODULES.length >= 45, `expected 45+ modules, got ${MODULES.length}`)
  })

  it('every module has route and APIs', () => {
    for (const m of MODULES) {
      assert.ok(m.route, `${m.id} missing route`)
      assert.ok(m.apis?.length, `${m.id} missing apis`)
    }
  })

  it('core CRM pages exist on disk', () => {
    for (const route of ['/leads', '/opportunities', '/customers', '/proposals', '/invoices']) {
      const page = join(root, 'app', route.slice(1), 'page.js')
      assert.ok(existsSync(page), `missing page ${page}`)
    }
  })

  it('enterprise QA audit script exists', () => {
    assert.ok(existsSync(join(root, 'scripts/qa/enterprise-qa-audit.mjs')))
    assert.ok(existsSync(join(root, 'scripts/qa/module-registry.mjs')))
  })

  it('playwright enterprise specs exist', () => {
    for (const name of [
      'module-navigation.spec.js',
      'api-modules.spec.js',
      'crud-workflows.spec.js',
      'retail-workflows.spec.js',
      'ui-patterns.spec.js',
      'helpers.js',
    ]) {
      assert.ok(existsSync(join(root, 'e2e/enterprise', name)), `missing e2e/enterprise/${name}`)
    }
  })
})

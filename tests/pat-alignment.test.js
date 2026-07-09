import { readFileSync } from 'fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { ruleScore } from '../lib/scoring.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const patSource = readFileSync(join(root, 'scripts/pat/run.mjs'), 'utf8')
const routeSource = readFileSync(join(root, 'app/api/[[...path]]/route.js'), 'utf8')
const processorsSource = readFileSync(join(root, 'lib/events/processors.js'), 'utf8')

test('PAT uses retail inventory routes instead of deprecated /retail/products', () => {
  assert.doesNotMatch(patSource, /\/retail\/products/)
  assert.match(patSource, /\/retail\/inventory/)
  assert.match(patSource, /\/retail\/inventory\/lookup/)
})

test('POST /leads uses synchronous ruleScore for fast API response', () => {
  const postBlock = routeSource.match(/if \(method === 'POST' && !id\) \{[\s\S]*?return json\(\{ lead: doc \}, \{ status: 201 \}\)/)
  assert.ok(postBlock, 'POST /leads handler block present')
  assert.match(postBlock[0], /const sc = ruleScore\(lead\)/)
  assert.doesNotMatch(postBlock[0], /await aiScore\(lead\)/)
})

test('agent_runtime processor is deferred so lead create does not block on LLM agents', () => {
  assert.match(processorsSource, /ASYNC_PROCESSORS/)
  assert.match(processorsSource, /AGENT_RUNTIME/)
})

test('ruleScore completes synchronously for PAT lead payload', () => {
  const start = performance.now()
  const result = ruleScore({
    name: 'PAT Lead',
    phone: '+919123456789',
    email: 'pat@example.com',
    company: 'PAT Corp',
    source: 'website',
    territory: 'Bengaluru',
  })
  const elapsed = performance.now() - start
  assert.ok(result.score >= 0 && result.score <= 100)
  assert.ok(['Hot', 'Warm', 'Cold'].includes(result.label))
  assert.ok(elapsed < 50, `ruleScore took ${elapsed}ms`)
})

#!/usr/bin/env node
/**
 * Verify Playwright Chromium can load on this host (checks libatk etc.).
 */
import { spawnSync } from 'child_process'
import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

function findChromiumBinary() {
  const cache = join(homedir(), '.cache/ms-playwright')
  if (!existsSync(cache)) return null

  function walk(dir, depth = 0) {
    if (depth > 6) return null
    for (const name of readdirSync(dir)) {
      const full = join(dir, name)
      const st = statSync(full)
      if (st.isDirectory()) {
        const found = walk(full, depth + 1)
        if (found) return found
        continue
      }
      if (name === 'chrome-headless-shell' || (name === 'chrome' && full.includes('chrome-linux'))) {
        return full
      }
    }
    return null
  }
  return walk(cache)
}

const bin = findChromiumBinary()
if (!bin) {
  console.error('Chromium not installed. Run: npm run test:e2e:install')
  process.exit(1)
}

const ldd = spawnSync('ldd', [bin], { encoding: 'utf8' })
if (ldd.status !== 0) {
  console.error('ldd failed:', ldd.stderr || ldd.stdout)
  process.exit(1)
}

const missing = ldd.stdout.split('\n').filter((l) => l.includes('not found'))
if (missing.length) {
  console.error('Missing shared libraries for Chromium:')
  for (const line of missing) console.error(' ', line.trim())
  console.error('\nFix on VPS (as root):')
  console.error('  sudo bash scripts/qa/install-playwright-system-deps.sh')
  process.exit(1)
}

console.log('Chromium system deps OK:', bin)

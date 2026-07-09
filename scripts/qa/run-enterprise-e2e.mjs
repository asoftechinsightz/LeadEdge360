#!/usr/bin/env node
/**
 * VPS-safe Enterprise Playwright runner.
 */
import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const cli = join(root, 'node_modules/@playwright/test/cli.js')
const verify = join(root, 'scripts/qa/verify-playwright-browser.mjs')
const depsScript = join(root, 'scripts/qa/install-playwright-system-deps.sh')

function runNode(args) {
  return spawnSync(process.execPath, args, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  })
}

if (!existsSync(cli)) {
  console.error('Missing @playwright/test. On VPS run: npm ci  (include devDependencies)')
  process.exit(1)
}

const base = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000'
console.log(`Enterprise E2E → ${base}`)

console.log('Ensuring Chromium browser binary…')
const install = runNode([cli, 'install', 'chromium'])
if (install.status !== 0) process.exit(install.status || 1)

console.log('Verifying Chromium system libraries…')
const check = runNode([verify])
if (check.status !== 0) {
  console.error(
    '\nBrowser cannot launch on this VPS (missing libatk etc.).\n' +
      'As root, run:\n' +
      `  sudo bash ${depsScript}\n` +
      'Then re-run: npm run test:e2e:enterprise',
  )
  process.exit(1)
}

const extraArgs = process.argv.slice(2)
const target = extraArgs[0] && !extraArgs[0].startsWith('-') ? extraArgs.shift() : 'e2e/enterprise'
const result = runNode([cli, 'test', target, '--project=enterprise', ...extraArgs])
process.exit(result.status ?? 1)

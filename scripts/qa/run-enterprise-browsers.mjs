#!/usr/bin/env node
/**
 * Enterprise Playwright — Firefox + WebKit smoke (module navigation + a11y).
 */
import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const cli = join(root, 'node_modules/@playwright/test/cli.js')

function runNode(args) {
  return spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', env: process.env })
}

if (!existsSync(cli)) {
  console.error('Missing @playwright/test. Run: npm ci')
  process.exit(1)
}

const base = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000'
console.log(`Enterprise browser matrix → ${base}`)

console.log('Installing Firefox + WebKit…')
const install = runNode([cli, 'install', 'firefox', 'webkit'])
if (install.status !== 0) process.exit(install.status || 1)

const dryRun = runNode([cli, 'install-deps', '--dry-run', 'firefox', 'webkit'])
if (dryRun.status !== 0) {
  console.error(
    '\nMissing Firefox/WebKit system libraries.\n' +
      'As root on VPS:\n' +
      '  sudo bash scripts/qa/install-playwright-all-browsers-deps.sh\n' +
      'Then re-run: npm run test:e2e:enterprise:browsers\n',
  )
  process.exit(1)
}

const extraArgs = process.argv.slice(2)
const result = runNode([
  cli,
  'test',
  'e2e/enterprise/module-navigation.spec.js',
  'e2e/enterprise/accessibility.spec.js',
  '--project=enterprise-firefox',
  '--project=enterprise-webkit',
  ...extraArgs,
])
process.exit(result.status ?? 1)

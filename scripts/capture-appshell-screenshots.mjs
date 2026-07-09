/**
 * Capture AppShell route screenshots after Phase 11 unification.
 * Usage: npm run dev -- --port 3007
 *        node scripts/capture-appshell-screenshots.mjs
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'docs', 'screenshots', 'appshell-phase11');
const baseUrl = process.env.PREVIEW_BASE_URL || 'http://localhost:3007';

const shots = [
  { path: '/dashboard', file: '01-dashboard.png' },
  { path: '/opportunities', file: '02-opportunities.png' },
  { path: '/revenue', file: '03-revenue.png' },
];

async function loadPlaywright() {
  try {
    return require('playwright');
  } catch {
    const { execSync } = await import('node:child_process');
    execSync('npm install --no-save playwright@1.49.1', { cwd: root, stdio: 'inherit' });
    return require('playwright');
  }
}

async function waitForServer(url, attempts = 30) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok || res.status < 500) return;
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error(`Server not ready at ${url}`);
}

async function main() {
  await waitForServer(baseUrl);
  await mkdir(outDir, { recursive: true });
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const shot of shots) {
    await page.goto(`${baseUrl}${shot.path}`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, shot.file), fullPage: false });
    console.log(`[screenshot] ${shot.file}`);
  }

  await browser.close();
  console.log(`[screenshot] Saved to ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

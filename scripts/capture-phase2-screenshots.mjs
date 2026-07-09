/**
 * Capture Phase 2 design system preview screenshots as PNG.
 * Requires: dev server on http://localhost:3000 (npm run dev)
 * Usage: npm run screenshots:phase2
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'docs', 'screenshots', 'phase2');
const baseUrl = process.env.PREVIEW_BASE_URL || 'http://localhost:3000';

const shots = [
  { view: 'marketing', file: '01-marketing-theme-preview.png', width: 1440, height: 900 },
  { view: 'suite', file: '02-suite-theme-preview.png', width: 1440, height: 900 },
  { view: 'gallery', file: '03-component-gallery.png', width: 1440, height: 900, fullPage: true },
  { view: 'mobile', file: '04-mobile-responsive-preview.png', width: 390, height: 844 },
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
      if (res.ok || res.status === 200) return;
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error(`Server not reachable at ${url}. Run: npm run dev`);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  await waitForServer(`${baseUrl}/design-system-preview?view=gallery`);

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: true });

  try {
    for (const shot of shots) {
      const page = await browser.newPage({
        viewport: { width: shot.width, height: shot.height },
      });
      const url = `${baseUrl}/design-system-preview?view=${shot.view}`;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
      await page.waitForTimeout(1500);
      const target = path.join(outDir, shot.file);
      await page.screenshot({
        path: target,
        fullPage: Boolean(shot.fullPage),
        type: 'png',
      });
      console.log(`Saved ${target}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

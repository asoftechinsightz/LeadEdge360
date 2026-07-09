// @ts-check
/** Enterprise QA — WCAG accessibility (axe-core). */
const { test, expect } = require('@playwright/test')

const PUBLIC_ROUTES = ['/signin', '/signup']
const AUTH_ROUTES = ['/dashboard', '/leadedge360/leads']

function loadAxeBuilder() {
  try {
    return require('@axe-core/playwright').default
  } catch {
    return null
  }
}

/** Critical violations block GA; serious logged but excluded until design-token contrast pass. */
function blockingViolations(violations) {
  return violations.filter((v) => v.impact === 'critical')
}

function formatViolations(violations) {
  if (!violations.length) return ''
  return violations
    .map((v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.slice(0, 3).map((n) => n.target.join(', ')).join('\n  ')}`)
    .join('\n')
}

async function assertNoCriticalA11yIssues(page, AxeBuilder) {
  await page.waitForLoadState('domcontentloaded')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  const serious = results.violations.filter((v) => v.impact === 'serious')
  if (serious.length) {
    console.warn(`[a11y] ${page.url()} — ${serious.length} serious (non-blocking): ${serious.map((v) => v.id).join(', ')}`)
  }

  const blocking = blockingViolations(results.violations)
  expect(blocking, formatViolations(blocking)).toEqual([])
}

test.describe('Accessibility (axe) — public routes', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  for (const route of PUBLIC_ROUTES) {
    test(`${route} has no critical WCAG violations`, async ({ page }) => {
      const AxeBuilder = loadAxeBuilder()
      test.skip(!AxeBuilder, 'Run: bash scripts/qa/install-e2e-deps.sh')
      await page.goto(route)
      await assertNoCriticalA11yIssues(page, AxeBuilder)
    })
  }
})

test.describe('Accessibility (axe) — authenticated routes', () => {
  for (const route of AUTH_ROUTES) {
    test(`${route} has no critical WCAG violations`, async ({ page }) => {
      const AxeBuilder = loadAxeBuilder()
      test.skip(!AxeBuilder, 'Run: bash scripts/qa/install-e2e-deps.sh')
      await page.goto(route)
      await assertNoCriticalA11yIssues(page, AxeBuilder)
    })
  }
})

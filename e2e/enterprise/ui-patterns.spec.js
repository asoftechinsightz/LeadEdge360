// @ts-check
/** Enterprise QA — search, pagination, empty/error states, auth pages. */
const { test, expect } = require('@playwright/test')
const { loginRequestWithRetry, authHeaders, MOBILE_ROUTES } = require('./helpers')

test.describe('Auth pages', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('sign-in page loads with form', async ({ page }) => {
    await page.goto('/signin')
    await expect(page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]'))).toBeVisible()
    await expect(page.getByPlaceholder(/password/i).or(page.locator('input[type="password"]'))).toBeVisible()
  })

  test('signup page loads', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('body')).toContainText(/sign up|register|create/i)
  })
})

const LEADS_LIST = '/leadedge360/leads'

test.describe('List UI patterns', () => {
  test('leads list supports search param', async ({ page }) => {
    await page.goto(LEADS_LIST)
    await expect(page.locator('body')).toBeVisible()
    const search = page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'))
    if (await search.count()) {
      await search.first().fill('test')
      await page.waitForTimeout(500)
    }
    expect((await page.locator('body').innerText()).toLowerCase()).not.toContain('application error')
  })

  test('leads pagination or list renders', async ({ page }) => {
    await page.goto(LEADS_LIST)
    await expect(page.locator('body')).toContainText(/lead/i, { timeout: 15_000 })
  })

  test('legacy /leads redirects to canonical list', async ({ page }) => {
    await page.goto('/leads?tour=1')
    await page.waitForURL(/\/leadedge360\/leads/, { timeout: 15_000 })
    expect(page.url()).toContain('tour=1')
  })

  test('customers page loads', async ({ page }) => {
    await page.goto('/customers')
    await expect(page.locator('body')).toContainText(/customer/i, { timeout: 15_000 })
  })

  test('invoices page loads', async ({ page }) => {
    await page.goto('/invoices')
    await expect(page.locator('body')).toContainText(/invoice/i, { timeout: 15_000 })
  })

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.locator('body')).toBeVisible()
    expect((await page.locator('body').innerText()).toLowerCase()).not.toContain('application error')
  })
})

test.describe('Lead detail (tasks embedded)', () => {
  test('lead detail page when leads exist', async ({ page, request }) => {
    const token = await loginRequestWithRetry(request)
    const listRes = await request.get('/api/leads?limit=1', { headers: authHeaders(token) })
    if (!listRes.ok()) return
    const leads = (await listRes.json()).leads || []
    if (!leads.length) return

    await page.goto(`/leadedge360/leads/${leads[0].id}`)
    await expect(page.locator('body')).toBeVisible()
    expect((await page.locator('body').innerText()).toLowerCase()).not.toContain('application error')
  })
})

test.describe('Mobile responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
  })

  for (const route of MOBILE_ROUTES) {
    test(`mobile ${route}`, async ({ page }) => {
      await page.goto(route)
      await expect(page.locator('body')).toBeVisible()
    })
  }
})

test.describe('Security validation', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('unauthenticated API returns 401/403', async ({ request }) => {
    const res = await request.get('/api/leads?limit=1')
    expect([401, 403]).toContain(res.status())
  })

  test('invalid token rejected', async ({ request }) => {
    const res = await request.get('/api/leads?limit=1', {
      headers: { Authorization: 'Bearer invalid-token' },
    })
    expect([401, 403]).toContain(res.status())
  })
})

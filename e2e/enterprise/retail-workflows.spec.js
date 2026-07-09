// @ts-check
/** Enterprise QA — RetailEdge360 UI sections and POS API. */
const { test, expect } = require('@playwright/test')
const { loginRequestWithRetry, authHeaders } = require('./helpers')

test.describe('RetailEdge360 UI', () => {
  test('dashboard loads KPIs and inventory table', async ({ page }) => {
    await page.goto('/retailedge360')
    await expect(page.locator('body')).toContainText(/retail|inventory|sku/i)
    await expect(page.getByRole('button', { name: /add sku/i })).toBeVisible({ timeout: 15_000 })
  })

  test('POS checkout section visible', async ({ page }) => {
    await page.goto('/retailedge360')
    await expect(page.locator('body')).toContainText(/checkout|pos|billing|scan/i, { timeout: 15_000 })
  })

  test('analytics section renders', async ({ page }) => {
    await page.goto('/retailedge360')
    const body = await page.locator('body').innerText()
    expect(body.length).toBeGreaterThan(100)
    expect(body.toLowerCase()).not.toContain('application error')
  })
})

test.describe('RetailEdge360 API', () => {
  let token

  test.beforeAll(async ({ request }) => {
    token = await loginRequestWithRetry(request)
  })

  test('inventory list returns 200', async ({ request }) => {
    const res = await request.get('/api/retail/inventory', { headers: authHeaders(token) })
    expect(res.ok()).toBeTruthy()
  })

  test('KPIs endpoint', async ({ request }) => {
    const res = await request.get('/api/retail/kpis', { headers: authHeaders(token) })
    expect(res.ok()).toBeTruthy()
  })

  test('POS checkout rejects empty cart', async ({ request }) => {
    const res = await request.post('/api/retail/pos/checkout', {
      headers: authHeaders(token),
      data: { items: [] },
    })
    expect([400, 422]).toContain(res.status())
  })
})

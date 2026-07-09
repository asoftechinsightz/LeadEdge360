// @ts-check
/** Integration Center — API and settings UI smoke. */
const { test, expect } = require('@playwright/test')
const { loginRequestWithRetry, authHeaders, pollRequest } = require('./helpers')

let token

test.beforeAll(async ({ request }) => {
  token = await loginRequestWithRetry(request)
})

test.describe('Integration Center API', () => {
  test('GET /api/integrations returns catalog', async ({ request }) => {
    const res = await pollRequest(
      request,
      '/api/integrations',
      { method: 'GET', headers: authHeaders(token) },
      [200],
      { tries: 4, delayMs: 500 },
    )
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.integrations)).toBe(true)
    expect(data.integrations.length).toBeGreaterThanOrEqual(5)
  })

  test('GET /api/integrations/health returns dashboard', async ({ request }) => {
    const res = await pollRequest(
      request,
      '/api/integrations/health',
      { method: 'GET', headers: authHeaders(token) },
      [200],
      { tries: 4, delayMs: 500 },
    )
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.summary).toBeTruthy()
    expect(Array.isArray(data.integrations)).toBe(true)
  })

  test('GET /api/integrations/audit returns logs array', async ({ request }) => {
    const res = await pollRequest(
      request,
      '/api/integrations/audit?limit=5',
      { method: 'GET', headers: authHeaders(token) },
      [200],
      { tries: 4, delayMs: 500 },
    )
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.logs)).toBe(true)
  })

  test('connect without credentials returns 400', async ({ request }) => {
    const res = await pollRequest(
      request,
      '/api/integrations/whatsapp/connect',
      { method: 'POST', headers: authHeaders(token), data: {} },
      [400, 403],
      { tries: 3, delayMs: 400 },
    )
    expect([400, 403]).toContain(res.status())
  })
})

test.describe('Integration Center UI', () => {
  test('settings integrations tab loads', async ({ page }) => {
    const { loginPage } = require('./helpers')
    await loginPage(page)
    await page.goto('/settings')
    await page.getByRole('tab', { name: /integrations/i }).click()
    await expect(page.getByRole('heading', { name: /integration center/i })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/WhatsApp Business Cloud/i)).toBeVisible()
  })
})

// @ts-check
const { test, expect } = require('@playwright/test')

test('API health responds ok', async ({ request }) => {
  const res = await request.get('/api/')
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  expect(body.ok).toBe(true)
})

test('sign-in page loads', async ({ page }) => {
  await page.goto('/signin')
  await expect(page).toHaveURL(/signin/)
  await expect(page.locator('body')).toContainText(/sign|login|email/i)
})

test('mobile viewport sign-in', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/signin')
  await expect(page.locator('body')).toBeVisible()
})

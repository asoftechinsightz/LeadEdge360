// @ts-check
/** Enterprise QA — authenticated navigation across all suite routes. */
const { test, expect } = require('@playwright/test')
const { MODULE_ROUTES } = require('./helpers')

test.describe('Enterprise module navigation', () => {
  for (const route of MODULE_ROUTES) {
    test(`loads ${route}`, async ({ page }) => {
      const res = await page.goto(route)
      expect(res?.status()).toBeLessThan(500)
      await expect(page.locator('body')).toBeVisible()
      const body = await page.locator('body').innerText()
      expect(body.toLowerCase()).not.toContain('application error')
    })
  }
})

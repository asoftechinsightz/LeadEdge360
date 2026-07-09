// @ts-check
/** One-time login — saves storageState for all enterprise UI tests (avoids auth rate limit). */
const { test: setup } = require('@playwright/test')
const fs = require('fs')
const path = require('path')
const { loginViaApi } = require('./helpers')

const authDir = path.join(__dirname, '.auth')
const authFile = path.join(authDir, 'user.json')

setup('authenticate once for enterprise suite', async ({ page }) => {
  fs.mkdirSync(authDir, { recursive: true })
  await loginViaApi(page)
  await page.context().storageState({ path: authFile })
})

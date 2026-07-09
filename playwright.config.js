// @ts-check
const path = require('path')
const { defineConfig } = require('@playwright/test')

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000'
const isRemote = /^https?:\/\//.test(baseURL) && !baseURL.includes('127.0.0.1') && !baseURL.includes('localhost')
const enterpriseAuth = path.join(__dirname, 'e2e/enterprise/.auth/user.json')

module.exports = defineConfig({
  testDir: './e2e',
  timeout: isRemote ? 90_000 : 60_000,
  expect: { timeout: 15_000 },
  retries: isRemote ? 1 : 0,
  workers: isRemote ? 1 : undefined,
  fullyParallel: !isRemote,
  use: {
    baseURL,
    trace: 'on-first-retry',
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'enterprise-setup',
      testMatch: /enterprise\/auth\.setup\.js/,
    },
    {
      name: 'enterprise',
      testMatch: /enterprise\/.*\.spec\.js/,
      dependencies: ['enterprise-setup'],
      use: {
        browserName: 'chromium',
        storageState: enterpriseAuth,
      },
    },
    {
      name: 'enterprise-firefox',
      testMatch: /enterprise\/(module-navigation|accessibility)\.spec\.js/,
      dependencies: ['enterprise-setup'],
      use: {
        browserName: 'firefox',
        storageState: enterpriseAuth,
      },
    },
    {
      name: 'enterprise-webkit',
      testMatch: /enterprise\/(module-navigation|accessibility)\.spec\.js/,
      dependencies: ['enterprise-setup'],
      use: {
        browserName: 'webkit',
        storageState: enterpriseAuth,
      },
    },
    {
      name: 'chromium',
      testMatch: /.*\.spec\.js/,
      testIgnore: /enterprise\//,
      use: { browserName: 'chromium' },
    },
  ],
})

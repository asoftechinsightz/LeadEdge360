// @ts-check
/** Enterprise QA — API integration smoke per module area. */
const { test, expect } = require('@playwright/test')
const { loginRequestWithRetry, authHeaders, API_SMOKE, assertStatus, fetchWithRetry, pollRequest } = require('./helpers')

let token

test.beforeAll(async ({ request }) => {
  token = await loginRequestWithRetry(request)
})

test.describe('Enterprise API module smoke', () => {
  for (const spec of API_SMOKE) {
    test(`${spec.module} — ${spec.method} ${spec.path}`, async ({ request }) => {
      const res = await fetchWithRetry(
        request,
        spec.path,
        { method: spec.method, headers: authHeaders(token) },
        spec.expectStatus,
      )
      expect(assertStatus(res, spec.expectStatus)).toBeTruthy()
    })
  }
})

test.describe('RBAC / tenant isolation', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('unauthenticated CRM blocked', async ({ request }) => {
    const res = await pollRequest(
      request,
      '/api/leads?limit=1',
      { method: 'GET' },
      [401, 403],
      { tries: 6, delayMs: 700 },
    )
    expect([401, 403], `unauthenticated CRM returned ${res.status()}`).toContain(res.status())
  })

  test('foreign lead ID blocked', async ({ request }) => {
    const res = await pollRequest(
      request,
      '/api/leads/00000000-0000-0000-0000-000000000099',
      { method: 'GET', headers: authHeaders(token) },
      [403, 404],
      { tries: 4, delayMs: 500 },
    )
    expect([403, 404]).toContain(res.status())
  })

  test('admin routes require elevated role or return 403', async ({ request }) => {
    const res = await pollRequest(
      request,
      '/api/admin/users',
      { method: 'GET', headers: authHeaders(token) },
      [200, 403],
      { tries: 4, delayMs: 500 },
    )
    expect([200, 403]).toContain(res.status())
  })
})

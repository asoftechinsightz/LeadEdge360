// @ts-check
const { test, expect } = require('@playwright/test')

const EMAIL = process.env.CERT_ADMIN_EMAIL || 'admin@asoftechinsightz.com'
const PASSWORD = process.env.CERT_ADMIN_PASSWORD || 'ChangeMe@2025'

async function login(request) {
  const res = await request.post('/api/auth/login-password', {
    data: { email: EMAIL, password: PASSWORD },
  })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  expect(body.accessToken).toBeTruthy()
  return body.accessToken
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

test.describe('CRM API workflow', () => {
  test('territory create + patch + lead assign', async ({ request }) => {
    const token = await login(request)
    const ts = Date.now()

    const createRes = await request.post('/api/territories', {
      headers: authHeaders(token),
      data: { name: `E2E Territory ${ts}`, region: 'South', manager: 'E2E Manager' },
    })
    expect(createRes.status()).toBe(201)
    const created = await createRes.json()
    const territoryId = created.data?.id
    expect(territoryId).toBeTruthy()

    const patchRes = await request.patch(`/api/territories/${territoryId}`, {
      headers: authHeaders(token),
      data: { manager: 'Updated Manager' },
    })
    expect(patchRes.ok()).toBeTruthy()
    const patched = await patchRes.json()
    expect(patched.data?.manager).toBe('Updated Manager')

    const leadRes = await request.post('/api/leads', {
      headers: authHeaders(token),
      data: {
        name: `E2E Lead ${ts}`,
        phone: `+9199${String(ts).slice(-8)}`,
        email: `e2e-${ts}@example.com`,
        territory: created.data?.name,
      },
    })
    expect(leadRes.status()).toBe(201)
    const leadId = (await leadRes.json()).lead?.id
    expect(leadId).toBeTruthy()

    const assignRes = await request.patch(`/api/leads/${leadId}`, {
      headers: authHeaders(token),
      data: { territory: created.data?.name },
    })
    expect(assignRes.ok()).toBeTruthy()
  })

  test('campaign create + detail + status patch', async ({ request }) => {
    const token = await login(request)
    const ts = Date.now()

    const createRes = await request.post('/api/campaigns', {
      headers: authHeaders(token),
      data: { name: `E2E Campaign ${ts}`, channel: 'email' },
    })
    expect(createRes.ok()).toBeTruthy()
    const campaign = (await createRes.json()).campaign
    expect(campaign?.id).toBeTruthy()

    const getRes = await request.get(`/api/campaigns/${campaign.id}`, {
      headers: authHeaders(token),
    })
    expect(getRes.ok()).toBeTruthy()

    const patchRes = await request.patch(`/api/campaigns/${campaign.id}`, {
      headers: authHeaders(token),
      data: { status: 'scheduled' },
    })
    expect(patchRes.ok()).toBeTruthy()
    const updated = await patchRes.json()
    expect(updated.campaign?.status).toBe('scheduled')
  })

  test('invoice multi-line items POST + PATCH', async ({ request }) => {
    const token = await login(request)
    const ts = Date.now()

    const items = [
      { name: 'License', qty: 1, rate: 50000, amount: 50000 },
      { name: 'Support', qty: 2, rate: 10000, amount: 20000 },
      { name: 'Training', qty: 1, rate: 15000, amount: 15000 },
    ]
    const subtotal = 85000
    const gstAmount = subtotal * 0.18

    const createRes = await request.post('/api/invoices', {
      headers: authHeaders(token),
      data: {
        clientName: `E2E Client ${ts}`,
        subtotal,
        gstPercent: 18,
        gstAmount,
        totalAmount: subtotal + gstAmount,
        status: 'DRAFT',
        items,
      },
    })
    expect(createRes.ok()).toBeTruthy()
    const invoiceId = (await createRes.json()).invoice?.id
    expect(invoiceId).toBeTruthy()

    const patchRes = await request.patch(`/api/invoices/${invoiceId}`, {
      headers: authHeaders(token),
      data: {
        items: [
          ...items,
          { name: 'Onboarding', qty: 1, rate: 5000, amount: 5000 },
        ],
        subtotal: 90000,
        gstAmount: 16200,
        totalAmount: 106200,
      },
    })
    expect(patchRes.ok()).toBeTruthy()

    const jsonRes = await request.get(`/api/invoices/${invoiceId}?format=json`, {
      headers: authHeaders(token),
    })
    expect(jsonRes.ok()).toBeTruthy()
    const detail = await jsonRes.json()
    expect(detail.invoice?.items?.length).toBeGreaterThanOrEqual(3)
  })

  test('PDF revenue report export', async ({ request }) => {
    const token = await login(request)

    const createRes = await request.post('/api/reports/export', {
      headers: authHeaders(token),
      data: { type: 'revenue', exportType: 'pdf' },
    })
    expect(createRes.ok()).toBeTruthy()
    const exportId = (await createRes.json()).exportId
    expect(exportId).toBeTruthy()

    const downloadRes = await request.get(`/api/reports/export/${exportId}/download`, {
      headers: authHeaders(token),
    })
    expect(downloadRes.ok()).toBeTruthy()
    const contentType = downloadRes.headers()['content-type'] || ''
    expect(contentType).toContain('pdf')
  })
})

test('campaigns page loads after sign-in', async ({ page }) => {
  await page.goto('/signin')
  await page.getByLabel(/email/i).fill(EMAIL)
  await page.getByLabel(/password/i).fill(PASSWORD)
  await page.getByRole('button', { name: /sign in|log in/i }).click()
  await page.waitForURL(/\/(dashboard|leadedge|campaigns|products)/, { timeout: 15_000 }).catch(() => {})

  await page.goto('/campaigns')
  await expect(page.locator('body')).toContainText(/campaign/i)
})

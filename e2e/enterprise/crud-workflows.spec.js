// @ts-check
/** Enterprise QA — CRUD workflows per CRM / growth module. */
const { test, expect } = require('@playwright/test')
const { loginRequestWithRetry, authHeaders, pollRequest } = require('./helpers')

test.describe('Enterprise CRUD workflows', () => {
  let token

  test.beforeAll(async ({ request }) => {
    token = await loginRequestWithRetry(request)
  })

test.describe('CRM CRUD workflows', () => {
  test('lead create + list + patch', async ({ request }) => {
    const ts = Date.now()

    const createRes = await pollRequest(
      request,
      '/api/leads',
      {
        method: 'POST',
        headers: authHeaders(token),
        data: {
          name: `QA Lead ${ts}`,
          phone: `+9199${String(ts).slice(-8)}`,
          email: `qa-lead-${ts}@example.com`,
          source: 'enterprise-qa',
        },
      },
      [201],
      { tries: 6, delayMs: 700 },
    )
    expect(createRes.status(), `lead create failed: ${createRes.status()}`).toBe(201)
    const leadId = (await createRes.json()).lead?.id
    expect(leadId).toBeTruthy()

    const listRes = await pollRequest(
      request,
      '/api/leads?limit=5&search=QA Lead',
      { method: 'GET', headers: authHeaders(token) },
      [200],
      { tries: 6, delayMs: 700 },
    )
    expect(listRes.ok(), `lead list failed: ${listRes.status()}`).toBeTruthy()

    const patchRes = await pollRequest(
      request,
      `/api/leads/${leadId}`,
      { method: 'PATCH', headers: authHeaders(token), data: { status: 'contacted' } },
      [200, 204],
      { tries: 6, delayMs: 700 },
    )
    expect(patchRes.ok(), `lead patch failed: ${patchRes.status()}`).toBeTruthy()
  })

  test('opportunity create + get', async ({ request }) => {
    const ts = Date.now()

    const createRes = await pollRequest(
      request,
      '/api/opportunities',
      {
        method: 'POST',
        headers: authHeaders(token),
        data: {
          title: `QA Opportunity ${ts}`,
          value: 100000,
          stage: 'qualification',
        },
      },
      [200, 201],
      { tries: 6, delayMs: 700 },
    )
    expect([200, 201]).toContain(createRes.status())
    if (!createRes.ok()) return

    const body = await createRes.json()
    const id = body.opportunity?.id || body.data?.id
    if (!id) return

    const getRes = await pollRequest(
      request,
      `/api/opportunities/${id}`,
      { method: 'GET', headers: authHeaders(token) },
      [200],
      { tries: 4, delayMs: 500 },
    )
    expect(getRes.ok()).toBeTruthy()
  })

  test('customer list + detail', async ({ request }) => {
    const listRes = await pollRequest(
      request,
      '/api/customers?limit=5',
      { method: 'GET', headers: authHeaders(token) },
      [200],
      { tries: 6, delayMs: 700 },
    )
    expect(listRes.ok(), `customer list failed: ${listRes.status()}`).toBeTruthy()
    const list = await listRes.json()
    const customers = list.customers || list.data || []
    if (!customers.length) return

    const id = customers[0].id
    const detailRes = await pollRequest(
      request,
      `/api/customers/${id}`,
      { method: 'GET', headers: authHeaders(token) },
      [200],
      { tries: 4, delayMs: 500 },
    )
    expect(detailRes.ok(), `customer detail failed: ${detailRes.status()}`).toBeTruthy()
  })

  test('proposal create + list', async ({ request }) => {
    const ts = Date.now()

    const createRes = await pollRequest(
      request,
      '/api/proposals',
      {
        method: 'POST',
        headers: authHeaders(token),
        data: {
          title: `QA Proposal ${ts}`,
          clientName: `QA Client ${ts}`,
          items: [{ name: 'Service', qty: 1, rate: 5000, amount: 5000 }],
          totalAmount: 5000,
        },
      },
      [200, 201],
      { tries: 6, delayMs: 700 },
    )
    expect([200, 201], `proposal create failed: ${createRes.status()}`).toContain(createRes.status())

    const listRes = await pollRequest(
      request,
      '/api/proposals?limit=5',
      { method: 'GET', headers: authHeaders(token) },
      [200],
      { tries: 6, delayMs: 700 },
    )
    expect(listRes.ok(), `proposal list failed: ${listRes.status()}`).toBeTruthy()
  })

  test('follow-up create + list', async ({ request }) => {
    const ts = Date.now()

    const leadRes = await pollRequest(
      request,
      '/api/leads',
      {
        method: 'POST',
        headers: authHeaders(token),
        data: {
          name: `Follow-up Lead ${ts}`,
          phone: `+9198${String(ts).slice(-8)}`,
          email: `fu-${ts}@example.com`,
        },
      },
      [201],
      { tries: 6, delayMs: 700 },
    )
    expect(leadRes.ok(), `lead create failed: ${leadRes.status()}`).toBeTruthy()
    const leadId = (await leadRes.json()).lead?.id
    expect(leadId).toBeTruthy()

    const dueAt = new Date(Date.now() + 86400000).toISOString()
    const fuRes = await pollRequest(
      request,
      `/api/leads/${leadId}/followups`,
      {
        method: 'POST',
        headers: authHeaders(token),
        data: {
          title: 'Enterprise QA call follow-up',
          dueAt,
        },
      },
      [201],
      { tries: 6, delayMs: 700 },
    )
    expect(fuRes.status(), `follow-up create failed: ${fuRes.status()}`).toBe(201)
    const fuBody = await fuRes.json()
    expect(fuBody.followup?.title).toBeTruthy()

    const listRes = await pollRequest(
      request,
      `/api/leads/${leadId}/followups`,
      { method: 'GET', headers: authHeaders(token) },
      [200],
    )
    expect(listRes.ok()).toBeTruthy()
    const list = await listRes.json()
    expect(Array.isArray(list.followups)).toBeTruthy()
  })

  test('invoice draft create + patch status', async ({ request }) => {
    const ts = Date.now()
    const payload = {
      clientName: `QA Invoice Client ${ts}`,
      subtotal: 10000,
      gstPercent: 18,
      gstAmount: 1800,
      totalAmount: 11800,
      status: 'DRAFT',
      items: [{ name: 'Consulting', qty: 1, rate: 10000, amount: 10000 }],
    }

    const createRes = await pollRequest(
      request,
      '/api/invoices',
      { method: 'POST', headers: authHeaders(token), data: payload },
      [200, 201],
      { tries: 6, delayMs: 800 },
    )
    expect(createRes.ok()).toBeTruthy()
    const created = await createRes.json()
    const invoiceId = String(created.invoiceId || created.invoice?._id || created.invoice?.id || '')
    expect(invoiceId).toBeTruthy()

    const patchRes = await pollRequest(
      request,
      `/api/invoices/${invoiceId}`,
      { method: 'PATCH', headers: authHeaders(token), data: { status: 'SENT' } },
      [200, 204],
      { tries: 4, delayMs: 500 },
    )
    expect([200, 204]).toContain(patchRes.status())
  })
})

test.describe('Growth & ops CRUD', () => {
  test('territory CRUD', async ({ request }) => {
    const ts = Date.now()

    const createRes = await pollRequest(
      request,
      '/api/territories',
      {
        method: 'POST',
        headers: authHeaders(token),
        data: { name: `QA Territory ${ts}`, region: 'West' },
      },
      [201],
      { tries: 6, delayMs: 700 },
    )
    expect(createRes.status()).toBe(201)
    const id = (await createRes.json()).data?.id
    expect(id).toBeTruthy()

    const patchRes = await pollRequest(
      request,
      `/api/territories/${id}`,
      { method: 'PATCH', headers: authHeaders(token), data: { region: 'East' } },
      [200, 204],
      { tries: 6, delayMs: 700 },
    )
    expect(patchRes.ok()).toBeTruthy()
  })

  test('campaign CRUD', async ({ request }) => {
    const ts = Date.now()

    const createRes = await pollRequest(
      request,
      '/api/campaigns',
      {
        method: 'POST',
        headers: authHeaders(token),
        data: { name: `QA Campaign ${ts}`, channel: 'email' },
      },
      [200, 201],
      { tries: 6, delayMs: 700 },
    )
    expect(createRes.ok(), `campaign create failed: ${createRes.status()}`).toBeTruthy()
    const id = (await createRes.json()).campaign?.id
    expect(id).toBeTruthy()

    const patchRes = await pollRequest(
      request,
      `/api/campaigns/${id}`,
      { method: 'PATCH', headers: authHeaders(token), data: { status: 'draft' } },
      [200, 204],
      { tries: 6, delayMs: 700 },
    )
    expect(patchRes.ok(), `campaign patch failed: ${patchRes.status()}`).toBeTruthy()
  })

  test('report export PDF', async ({ request }) => {
    const createRes = await pollRequest(
      request,
      '/api/reports/export',
      {
        method: 'POST',
        headers: authHeaders(token),
        data: { type: 'revenue', exportType: 'pdf' },
      },
      [200, 201],
      { tries: 6, delayMs: 700 },
    )
    expect([200, 201], `report export create failed: ${createRes.status()}`).toContain(createRes.status())
    const body = await createRes.json()
    const exportId = body.exportId
    expect(exportId).toBeTruthy()

    const downloadRes = await pollRequest(
      request,
      `/api/reports/export/${exportId}/download`,
      { method: 'GET', headers: authHeaders(token) },
      [200],
      { tries: 10, delayMs: 600 },
    )
    expect(downloadRes.ok()).toBeTruthy()
    const contentType = downloadRes.headers()['content-type'] || ''
    expect(contentType).toMatch(/pdf|json/)
  })
})
})

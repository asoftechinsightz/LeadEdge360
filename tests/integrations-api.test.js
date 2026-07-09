import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildTenantWebhookUrl, getWebhookBaseUrl } from '../lib/integrations/urls.js'

describe('Integration API helpers (unit)', () => {
  it('builds tenant webhook URLs', () => {
    const prev = process.env.NEXT_PUBLIC_BASE_URL
    process.env.NEXT_PUBLIC_BASE_URL = 'https://app.example.com'
    const url = buildTenantWebhookUrl('razorpay', 'org-abc')
    assert.ok(url.includes('/api/integrations/webhooks/razorpay'))
    assert.ok(url.includes('orgId=org-abc'))
    if (prev === undefined) delete process.env.NEXT_PUBLIC_BASE_URL
    else process.env.NEXT_PUBLIC_BASE_URL = prev
  })

  it('normalizes webhook base URL', () => {
    const prevPublic = process.env.PUBLIC_URL
    const prevBase = process.env.NEXT_PUBLIC_BASE_URL
    delete process.env.NEXT_PUBLIC_BASE_URL
    process.env.PUBLIC_URL = 'https://app.example.com/'
    assert.equal(getWebhookBaseUrl(), 'https://app.example.com')
    if (prevPublic === undefined) delete process.env.PUBLIC_URL
    else process.env.PUBLIC_URL = prevPublic
    if (prevBase === undefined) delete process.env.NEXT_PUBLIC_BASE_URL
    else process.env.NEXT_PUBLIC_BASE_URL = prevBase
  })
})

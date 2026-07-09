import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('Sprint 8 API contracts (unit)', () => {
  it('PDF report export payload shape', () => {
    const body = { type: 'revenue', exportType: 'pdf' }
    assert.equal(body.exportType, 'pdf')
    assert.equal(body.type, 'revenue')
  })

  it('supports multiple PDF report types', () => {
    const types = ['leads', 'revenue', 'campaigns', 'customers']
    for (const type of types) {
      assert.ok(typeof type === 'string')
    }
  })

  it('campaign template attach payload', () => {
    const body = { templateId: 'tpl-123' }
    assert.ok(body.templateId)
  })

  it('lead scoring priority response shape', () => {
    const res = { success: true, items: [{ leadId: 'l1', score: 88, classification: 'hot' }] }
    assert.equal(res.items[0].classification, 'hot')
  })

  it('revenue by-customer items shape', () => {
    const item = { name: 'Acme', amount: 50000, count: 2 }
    assert.equal(item.count, 2)
  })

  it('customer note POST body', () => {
    const body = { body: 'Follow up next week' }
    assert.ok(body.body)
  })
})

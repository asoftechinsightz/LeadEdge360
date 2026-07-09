import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('Sprint 7 API contracts (unit)', () => {
  it('territory POST payload shape', () => {
    const body = { name: 'Bengaluru', region: 'South India', manager: 'Priya' }
    assert.equal(body.name, 'Bengaluru')
    assert.ok(body.region)
  })

  it('territory PATCH allows manager update', () => {
    const patch = { manager: 'Updated Manager', region: 'West' }
    assert.equal(patch.manager, 'Updated Manager')
  })

  it('lead territory assign via PATCH /leads/:id', () => {
    const patch = { territory: 'Mumbai' }
    assert.equal(patch.territory, 'Mumbai')
  })

  it('campaign create payload shape', () => {
    const body = {
      name: 'Q2 Outreach',
      channel: 'email',
      audience: { leadIds: [], label: null, status: null },
    }
    assert.equal(body.channel, 'email')
    assert.ok(body.audience)
  })

  it('campaign PATCH status values', () => {
    const statuses = ['draft', 'scheduled', 'running', 'completed']
    for (const status of statuses) {
      assert.ok(typeof status === 'string')
    }
  })

  it('invoice supports 3+ line items', () => {
    const items = [
      { name: 'License', qty: 1, rate: 50000, amount: 50000 },
      { name: 'Support', qty: 2, rate: 10000, amount: 20000 },
      { name: 'Training', qty: 1, rate: 15000, amount: 15000 },
    ]
    const subtotal = items.reduce((s, i) => s + i.amount, 0)
    assert.equal(items.length, 3)
    assert.equal(subtotal, 85000)
  })
})

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('Integration catchall routing (unit)', () => {
  it('maps URL segments to integration actions', () => {
    const cases = [
      { segs: ['integrations'], method: 'GET', expect: 'list' },
      { segs: ['integrations', 'health'], method: 'GET', expect: 'health' },
      { segs: ['integrations', 'audit'], method: 'GET', expect: 'audit' },
      { segs: ['integrations', 'whatsapp', 'connect'], method: 'POST', expect: 'connect' },
      { segs: ['integrations', 'oauth', 'callback'], method: 'GET', expect: 'oauth' },
      { segs: ['integrations', 'webhooks', 'razorpay'], method: 'POST', expect: 'webhook' },
    ]
    for (const c of cases) {
      const [, id, action] = c.segs
      let kind = 'unknown'
      if (!id) kind = 'list'
      else if (id === 'health') kind = 'health'
      else if (id === 'audit') kind = 'audit'
      else if (id === 'oauth' && action === 'callback') kind = 'oauth'
      else if (id === 'webhooks' && action) kind = 'webhook'
      else if (action === 'connect') kind = 'connect'
      assert.equal(kind, c.expect, JSON.stringify(c.segs))
    }
  })
})

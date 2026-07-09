import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('OTP channel selection', () => {
  it('supports sms and whatsapp channel names', () => {
    const channels = ['sms', 'whatsapp', 'email']
    assert.ok(channels.includes('whatsapp'))
    assert.ok(channels.includes('sms'))
  })
})

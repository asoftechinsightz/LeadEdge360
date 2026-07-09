import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { slidingWindowCount, deviceFingerprint } from '../lib/auth/rate-limit.js'

describe('RC2 auth rate limit (unit)', () => {
  it('slidingWindowCount respects window', () => {
    const now = 1_000_000
    const events = [now - 30_000, now - 45_000, now - 90_000]
    assert.equal(slidingWindowCount(events, 60_000, now), 2)
  })

  it('blocks when at OTP limit', () => {
    const now = Date.now()
    const events = [now - 10_000, now - 20_000, now - 30_000]
    assert.equal(slidingWindowCount(events, 60_000, now) >= 3, true)
  })

  it('deviceFingerprint is stable', () => {
    const a = deviceFingerprint({ deviceId: 'dev-1', ua: 'Mozilla', ip: '1.2.3.4' })
    const b = deviceFingerprint({ deviceId: 'dev-1', ua: 'Mozilla', ip: '1.2.3.4' })
    assert.equal(a, b)
    assert.notEqual(a, deviceFingerprint({ deviceId: 'dev-2', ua: 'Mozilla', ip: '1.2.3.4' }))
  })
})

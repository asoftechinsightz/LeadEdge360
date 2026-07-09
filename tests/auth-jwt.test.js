import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'

const SECRET = 'test-secret-for-ci-only'

describe('signed email verification pattern', () => {
  it('signs and verifies purpose-scoped tokens', () => {
    const token = jwt.sign(
      { sub: 'u1', email: 'a@b.com', purpose: 'email_verify' },
      SECRET,
      { expiresIn: 3600, issuer: 'asoftechinsightz' },
    )
    const payload = jwt.verify(token, SECRET, { issuer: 'asoftechinsightz' })
    assert.equal(payload.sub, 'u1')
    assert.equal(payload.purpose, 'email_verify')
  })
})

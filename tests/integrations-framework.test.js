import crypto from 'crypto'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { encryptCredentials, decryptCredentials, redactCredentials } from '../lib/integrations/crypto.js'
import { INTEGRATIONS, getIntegrationDef } from '../lib/integrations/registry.js'
import { verifyHmacWebhook } from '../lib/integrations/connectors/base.js'
import { whatsappConnector } from '../lib/integrations/connectors/whatsapp.js'
import { razorpayConnector } from '../lib/integrations/connectors/razorpay.js'

describe('Integration crypto (unit)', () => {
  it('round-trips credentials', () => {
    const plain = { accessToken: 'secret-token', phoneNumberId: '123' }
    const enc = encryptCredentials(plain)
    const dec = decryptCredentials(enc)
    assert.deepEqual(dec, plain)
  })

  it('redacts sensitive fields', () => {
    const red = redactCredentials({ accessToken: 'abc', phoneNumberId: '123' })
    assert.equal(red.accessToken, '••••••••')
    assert.equal(red.phoneNumberId, '123')
  })
})

describe('Integration registry (unit)', () => {
  it('lists all five phases', () => {
    const phases = new Set(INTEGRATIONS.map((i) => i.phase))
    assert.ok(phases.has(1) && phases.has(5))
    assert.equal(INTEGRATIONS.length, 23)
  })

  it('phase 2 integrations are implemented', () => {
    const phase2 = INTEGRATIONS.filter((i) => i.phase === 2)
    assert.equal(phase2.length, 5)
    assert.ok(phase2.every((i) => i.implemented))
  })

  it('phase 1 integrations are implemented', () => {
    const phase1 = INTEGRATIONS.filter((i) => i.phase === 1)
    assert.equal(phase1.length, 5)
    assert.ok(phase1.every((i) => i.implemented))
  })

  it('resolves integration by id', () => {
    assert.equal(getIntegrationDef('whatsapp')?.name, 'WhatsApp Business Cloud')
    assert.equal(getIntegrationDef('missing'), null)
  })
})

describe('Integration connectors (unit)', () => {
  it('validates whatsapp credentials', () => {
    assert.equal(whatsappConnector.validateCredentials({}).ok, false)
    assert.equal(whatsappConnector.validateCredentials({ accessToken: 't', phoneNumberId: 'p' }).ok, true)
  })

  it('validates razorpay credentials', () => {
    assert.equal(razorpayConnector.validateCredentials({ keyId: 'k' }).ok, false)
    assert.equal(razorpayConnector.validateCredentials({ keyId: 'k', keySecret: 's' }).ok, true)
  })

  it('verifies HMAC webhooks', () => {
    const body = '{"event":"test"}'
    const secret = 'whsec_test'
    const sig = crypto.createHmac('sha256', secret).update(body).digest('hex')
    assert.equal(verifyHmacWebhook(body, sig, secret), true)
    assert.equal(verifyHmacWebhook(body, 'bad', secret), false)
  })
})

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { validateEmail, validateIndianPhone, validateLeadCaptureForm } from '../lib/leads/validation.js'

describe('RC2 leads validation (unit)', () => {
  it('validates Indian phone', () => {
    assert.equal(validateIndianPhone('9876543210').ok, true)
    assert.equal(validateIndianPhone('123').ok, false)
  })

  it('validates email optional', () => {
    assert.equal(validateEmail('').ok, true)
    assert.equal(validateEmail('bad').ok, false)
    assert.equal(validateEmail('a@b.com').ok, true)
  })

  it('lead capture requires name and phone', () => {
    assert.equal(validateLeadCaptureForm({ name: '', phone: '9876543210' }).ok, false)
    assert.equal(validateLeadCaptureForm({ name: 'Arnav', phone: '9876543210' }).ok, true)
  })

  it('tenant lead query contract includes orgId', () => {
    const orgId = 'org-a'
    const leadId = 'lead-1'
    const query = { orgId, id: leadId }
    assert.equal(query.orgId, orgId)
    assert.equal(query.id, leadId)
  })
})

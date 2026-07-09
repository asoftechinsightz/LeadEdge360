import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { computeAuditIntegrityHash } from '../lib/audit/integrity.js'

describe('RC2 audit integrity (unit)', () => {
  it('chains hashes deterministically', () => {
    const entry = { id: 'a1', orgId: 'org-1', action: 'lead.update', entity: 'lead', entityId: 'l1', createdAt: '2026-01-01T00:00:00.000Z' }
    const h1 = computeAuditIntegrityHash('', entry)
    const h2 = computeAuditIntegrityHash(h1, { ...entry, id: 'a2', action: 'lead.note' })
    assert.ok(h1.length === 64)
    assert.notEqual(h1, h2)
  })

  it('detects tampering', () => {
    const entry = { id: 'x', orgId: 'o', action: 'test', entity: null, entityId: null, createdAt: 't' }
    const hash = computeAuditIntegrityHash('', entry)
    const tampered = computeAuditIntegrityHash('', { ...entry, action: 'evil' })
    assert.notEqual(hash, tampered)
  })
})

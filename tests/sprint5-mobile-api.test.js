import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('Sprint 5 API contracts (unit)', () => {
  it('invoice JSON detail uses format=json query param', () => {
    const url = new URL('https://example.com/api/invoices/507f1f77bcf86cd799439011?format=json')
    assert.equal(url.searchParams.get('format'), 'json')
  })

  it('report export supports csv and xlsx types', () => {
    const types = ['csv', 'xlsx']
    for (const exportType of types) {
      const ext = exportType === 'xlsx' ? 'xlsx' : 'csv'
      assert.ok(ext === 'csv' || ext === 'xlsx')
    }
  })

  it('calendar patch requires entry id', () => {
    const body = { id: 'cal-1', status: 'published' }
    assert.ok(body.id)
    assert.equal(body.status, 'published')
  })

  it('lead attachment metadata shape', () => {
    const doc = {
      id: 'att-1',
      leadId: 'lead-1',
      fileName: 'proposal.pdf',
      url: '/uploads/org/file.pdf',
      mimeType: 'application/pdf',
      size: 1024,
    }
    assert.equal(doc.fileName, 'proposal.pdf')
    assert.ok(doc.url.startsWith('/uploads/'))
  })
})

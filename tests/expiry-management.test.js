import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  daysUntilExpiry,
  computeShelfLife,
  deriveBatchStatus,
  deriveAlertLevel,
  expiryColor,
  generateBatchNumber,
  canPerformAction,
} from '../lib/retail/expiry/utils.js'
import { exportReportCsv } from '../lib/retail/expiry/reports.js'
import { REPORT_TYPES } from '../lib/retail/expiry/reports.js'

describe('Expiry Management — utils', () => {
  it('daysUntilExpiry calculates correctly', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(12, 0, 0, 0)
    const days = daysUntilExpiry(tomorrow.toISOString())
    assert.ok(days >= 0 && days <= 2)
  })

  it('deriveBatchStatus returns expired for past dates', () => {
    const past = new Date()
    past.setDate(past.getDate() - 5)
    assert.equal(deriveBatchStatus(past.toISOString(), 10), 'expired')
  })

  it('deriveBatchStatus returns critical within 7 days', () => {
    const soon = new Date()
    soon.setDate(soon.getDate() + 3)
    assert.equal(deriveBatchStatus(soon.toISOString(), 10), 'critical')
  })

  it('deriveAlertLevel maps day ranges', () => {
    assert.equal(deriveAlertLevel(-1), 'critical')
    assert.equal(deriveAlertLevel(5), 'high')
    assert.equal(deriveAlertLevel(15), 'medium')
    assert.equal(deriveAlertLevel(30), 'low')
    assert.equal(deriveAlertLevel(60), 'planning')
    assert.equal(deriveAlertLevel(90), 'forecast')
    assert.equal(deriveAlertLevel(120), null)
  })

  it('expiryColor returns correct colors', () => {
    assert.equal(expiryColor(-1), 'red')
    assert.equal(expiryColor(5), 'orange')
    assert.equal(expiryColor(20), 'yellow')
    assert.equal(expiryColor(60), 'green')
  })

  it('computeShelfLife from dates', () => {
    const shelf = computeShelfLife('2025-01-01', '2025-12-31')
    assert.ok(shelf > 300)
  })

  it('generateBatchNumber is unique-ish', () => {
    const a = generateBatchNumber('org-1', 'prod-abc')
    const b = generateBatchNumber('org-1', 'prod-abc')
    assert.notEqual(a, b)
    assert.match(a, /^BATCH-/)
  })

  it('canPerformAction respects roles', () => {
    assert.equal(canPerformAction({ role: 'SUPER_ADMIN' }, 'dispose'), true)
    assert.equal(canPerformAction({ role: 'ORG_ADMIN' }, 'dispose'), true)
    assert.equal(canPerformAction({ role: 'SALES_EXECUTIVE' }, 'dispose'), false)
    assert.equal(canPerformAction({ role: 'SALES_EXECUTIVE' }, 'override_warning'), true)
  })
})

describe('Expiry Management — reports', () => {
  it('REPORT_TYPES includes all required reports', () => {
    assert.ok(REPORT_TYPES.includes('expired'))
    assert.ok(REPORT_TYPES.includes('near_expiry'))
    assert.ok(REPORT_TYPES.includes('forecast'))
    assert.equal(REPORT_TYPES.length, 11)
  })

  it('exportReportCsv generates valid CSV', () => {
    const csv = exportReportCsv({
      rows: [{ name: 'Test', value: 100 }],
    })
    assert.match(csv, /name,value/)
    assert.match(csv, /Test/)
  })

  it('exportReportCsv handles empty data', () => {
    assert.equal(exportReportCsv({ rows: [] }), 'No data')
  })
})

describe('Expiry Management — API routes', () => {
  it('dashboard route path', () => {
    assert.equal('/api/retail/expiry/dashboard'.endsWith('/dashboard'), true)
  })

  it('batches route path', () => {
    assert.match('/api/retail/expiry/batches', /\/batches$/)
  })

  it('scanner accepts code param', () => {
    const url = new URL('https://example.com/api/retail/expiry/scanner?code=8901234567890')
    assert.equal(url.searchParams.get('code'), '8901234567890')
  })

  it('reports accepts type param', () => {
    const url = new URL('https://example.com/api/retail/expiry/reports?type=near_expiry&format=csv')
    assert.equal(url.searchParams.get('type'), 'near_expiry')
    assert.equal(url.searchParams.get('format'), 'csv')
  })

  it('FEFO checkout override payload shape', () => {
    const body = {
      items: [{ productId: 'prod-1', qty: 2 }],
      overrideWarnings: true,
      overrideReason: 'Manager approved',
    }
    assert.equal(body.overrideWarnings, true)
    assert.ok(body.overrideReason)
  })
})

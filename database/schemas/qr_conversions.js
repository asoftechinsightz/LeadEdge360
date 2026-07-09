/**
 * Sprint 2 — qr_conversions collection schema (MongoDB).
 */

export const QR_CONVERSION_EXAMPLE = {
  id: '00000000-0000-4000-8000-000000000012',
  orgId: 'demo-org',
  qrCodeId: '00000000-0000-4000-8000-000000000010',
  conversionType: 'lead',
  value: null,
  metadata: {
    leadId: 'lead-123',
    ip: '127.0.0.1',
    deviceType: 'mobile',
    browser: 'chrome',
    country: 'IN',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin-user-id',
  updatedBy: 'admin-user-id',
}

export const QR_CONVERSION_INDEXES = [
  { key: { orgId: 1, qrCodeId: 1, createdAt: -1 }, name: 'qr_conversions_org_qr_createdAt' },
  { key: { orgId: 1, createdAt: -1 }, name: 'qr_conversions_orgId_createdAt' },
]

/**
 * Sprint 2 — qr_events collection schema (MongoDB).
 */

export const QR_EVENT_TYPES = ['scan', 'click', 'conversion']

export const QR_EVENT_EXAMPLE = {
  id: '00000000-0000-4000-8000-000000000011',
  orgId: 'demo-org',
  qrCodeId: '00000000-0000-4000-8000-000000000010',
  eventType: 'scan',
  metadata: {
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    deviceType: 'mobile',
    browser: 'chrome',
    country: 'IN',
    visitorKey: '127.0.0.1:Mozilla/5.0',
  },
  createdAt: new Date().toISOString(),
}

export const QR_EVENT_INDEXES = [
  { key: { orgId: 1, qrCodeId: 1, createdAt: -1 }, name: 'qr_events_org_qr_createdAt' },
  { key: { orgId: 1, eventType: 1, createdAt: -1 }, name: 'qr_events_org_type_createdAt' },
]

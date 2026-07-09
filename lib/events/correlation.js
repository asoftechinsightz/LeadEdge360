import { randomUUID } from 'crypto'

export function generateCorrelationId() {
  return `corr_${randomUUID()}`
}

export function generateRequestId() {
  return `req_${randomUUID().slice(0, 12)}`
}

/**
 * Extract trace context from an HTTP request or pass-through object.
 */
export function extractTraceContext(reqOrHeaders = {}) {
  const headers = reqOrHeaders.headers || reqOrHeaders
  const get = typeof headers.get === 'function'
    ? (k) => headers.get(k)
    : (k) => headers[k] || headers[k.toLowerCase()]

  return {
    correlationId: get('x-correlation-id') || get('X-Correlation-Id') || generateCorrelationId(),
    requestId: get('x-request-id') || get('X-Request-Id') || generateRequestId(),
    sessionId: get('x-session-id') || get('X-Session-Id') || null,
    causationId: get('x-causation-id') || get('X-Causation-Id') || null,
  }
}

export function parseDeviceFromUa(ua = '') {
  const s = String(ua)
  if (/mobile|android|iphone|ipad/i.test(s)) return 'mobile'
  if (/tablet/i.test(s)) return 'tablet'
  return 'desktop'
}

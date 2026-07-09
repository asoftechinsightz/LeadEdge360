// k6 load test — run: k6 run scripts/load/k6-production.js
// Env: K6_BASE_URL, K6_TOKEN, K6_VUS (default 1000), K6_DURATION (default 5m)

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend, Rate } from 'k6/metrics'

const BASE = __ENV.K6_BASE_URL || 'http://127.0.0.1:3000'
const TOKEN = __ENV.K6_TOKEN || ''
const errorRate = new Rate('errors')
const apiLatency = new Trend('api_latency', true)

export const options = {
  scenarios: {
    ramp_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 200 },
        { duration: '3m', target: 1000 },
        { duration: '5m', target: 1000 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<300'],
    errors: ['rate<0.05'],
  },
}

function authHeaders() {
  const h = { 'Content-Type': 'application/json' }
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`
  return h
}

export default function () {
  const scenarios = [
    () => http.get(`${BASE}/api/health/ready`),
    () => http.get(`${BASE}/api/leads?limit=20`, { headers: authHeaders() }),
    () => http.get(`${BASE}/api/opportunities?limit=20`, { headers: authHeaders() }),
    () => http.get(`${BASE}/api/revenue/dashboard`, { headers: authHeaders() }),
    () => http.get(`${BASE}/api/whatsapp/templates`, { headers: authHeaders() }),
    () => http.get(`${BASE}/api/retail/inventory/lookup?sku=8900000000000`, { headers: authHeaders() }),
  ]
  const fn = scenarios[Math.floor(Math.random() * scenarios.length)]
  const res = fn()
  apiLatency.add(res.timings.duration)
  const ok = check(res, { 'status 2xx': (r) => r.status >= 200 && r.status < 300 })
  errorRate.add(!ok)
  sleep(0.5)
}

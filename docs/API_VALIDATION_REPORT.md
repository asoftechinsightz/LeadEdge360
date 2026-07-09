# API Validation Report

**Generated:** 2026-07-02T21:38:08.895Z
**Unit tests:** 73 passing (node --test tests/*.test.js)
**PAT API checks:** PASSED (production VPS)
**OpenAPI documented paths:** 200+

| Module | API endpoints | PAT | E2E API test | Gaps |
|--------|---------------|-----|--------------|------|
| Quotations | POST /api/proposals/auto-generate | ⚠️ | ✅ | — |
| Notes | POST /api/customers/:id/notes | ⚠️ | ✅ | — |
| Marketing Engine | GET /api/marketing-engine/config | ⚠️ | ✅ | — |
| Business Card | GET /api/growth/business-card | ⚠️ | ✅ | SMTP optional — outbound email may be disabled |
| Reviews | GET /api/growth/reviews/summary | ⚠️ | ✅ | — |
| Growth Audit | POST /api/growth-audit | ⚠️ | ✅ | — |
| Dashboard | GET /api/dashboard/kpis | ⚠️ | ✅ | — |
| AI Command Center | GET /api/agents | ⚠️ | ✅ | — |
| AI Insights | GET /api/agents/analytics | ⚠️ | ✅ | — |
| Automation Hub | GET /api/agents/settings | ⚠️ | ✅ | — |
| Geo Lead Finder | POST /api/scanner/geo | ⚠️ | ✅ | Requires GOOGLE_MAPS_API_KEY / GOOGLE_PLACES_API_KEY |
| Revenue Intel | GET /api/revenue/metrics | ⚠️ | ✅ | — |
| Conversations | GET /api/whatsapp/threads | ⚠️ | ✅ | — |
| Reports | POST /api/reports/export | ⚠️ | ✅ | — |
| Event Operations | GET /api/platform/events | ⚠️ | ✅ | — |
| AI Operations | GET /api/platform/ai-ops | ⚠️ | ✅ | — |
| AI Analytics | GET /api/agents/analytics | ⚠️ | ✅ | — |
| AI Agent Timeline | GET /api/platform/ai-timeline | ⚠️ | ✅ | — |
| Users | GET /api/admin/users | ⚠️ | ✅ | — |
| Organization | GET /api/onboarding/status | ⚠️ | ✅ | — |
| Products | GET /api/catalog | ⚠️ | ✅ | — |
| Sales | GET /api/retail/sales | ⚠️ | ✅ | — |
| Stores | GET /api/retail/stores | ⚠️ | ✅ | — |
| Retail Reports | GET /api/retail/kpis | ⚠️ | ✅ | — |
| Tasks | GET /api/leads/:id, PATCH /api/leads/:id | ⚠️ | ✅ | — |
| Follow-ups | POST /api/leads/:id/followups, GET /api/leads/:id/followups | ⚠️ | ✅ | — |
| Revenue Analytics | GET /api/revenue/trends, GET /api/revenue/forecast | ⚠️ | ✅ | — |
| Lead Capture (QR) | GET /api/qr, POST /api/qr | ⚠️ | ✅ | — |
| Website Scanner | GET /api/scanner/jobs, POST /api/scanner/run | ⚠️ | ✅ | Requires GOOGLE_MAPS_API_KEY / GOOGLE_PLACES_API_KEY |
| Business Analytics | GET /api/analytics/summary, GET /api/analytics/funnel | ⚠️ | ✅ | — |
| Territory Management | GET /api/territories, POST /api/territories | ⚠️ | ✅ | — |
| Agent Runtime | GET /api/agents/tasks, POST /api/agents/worker/run | ⚠️ | ✅ | — |
| Settings | GET /api/settings/branding, PATCH /api/users/me | ⚠️ | ✅ | — |
| Payments | GET /api/payments, POST /api/payments/create-order | ⚠️ | ✅ | — |
| Campaigns | GET /api/campaigns, POST /api/campaigns | ⚠️ | ✅ | SMTP optional — outbound email may be disabled |
| Proposals | GET /api/proposals, POST /api/proposals, GET /api/proposals/:id/pdf | ⚠️ | ✅ | — |
| Roles & Permissions | GET /api/admin/roles | ✅ | ✅ | — |
| Retail Dashboard | GET /api/retail/kpis | ✅ | ✅ | — |
| POS Checkout | POST /api/retail/pos/checkout | ✅ | ✅ | — |
| Invoices | GET /api/invoices, POST /api/invoices, PATCH /api/invoices/:id | ⚠️ | ✅ | — |
| Opportunities | GET /api/opportunities, POST /api/opportunities | ✅ | ✅ | — |
| Customers | GET /api/customers, GET /api/customers/:id | ✅ | ✅ | — |
| Monitoring | GET /api/metrics, GET /api/health/ready | ✅ | ✅ | — |
| Subscription | GET /api/subscriptions, GET /api/billing/subscription | ✅ | ✅ | — |
| Signup OTP | POST /api/auth/register, POST /api/auth/verify-otp | ✅ | ✅ | — |
| Inventory | GET /api/retail/inventory, POST /api/retail/inventory | ✅ | ✅ | — |
| Revenue | GET /api/revenue/dashboard, GET /api/revenue/summary | ✅ | ✅ | — |
| Authentication | POST /api/auth/login-password, POST /api/auth/register | ✅ | ✅ | — |
| Leads | GET /api/leads, POST /api/leads, PATCH /api/leads/:id | ✅ | ✅ | — |

## Critical API gaps

- `POST /auth/login-otp` — returns 404 (OTP login route not wired on all deployments)
- Razorpay payment APIs — keys not configured (pilot)
- Geo scanner — requires external API keys
- Campaign execute — requires SMTP for email channel
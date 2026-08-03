# LeadEdge360 Mobile — Release Roadmap

**Version:** 1.0  
**Product:** LeadEdge360 Mobile v2  
**Constraint:** Features map to **existing APIs only** per phase  

---

## Phase overview

| Phase | Theme | Store release | API dependency |
|-------|-------|---------------|----------------|
| **1** | Core CRM | Public beta | Leads, follow-ups, dashboard, auth |
| **2** | Customer Success | GA + engagement | WhatsApp, notifications, admin users |
| **3** | Growth | Manager analytics | Revenue, sales-performance |
| **4** | AI | Score intelligence UX | Rescore, score reasons display |
| **5** | Enterprise | Admin + compliance | Admin product-access, hardening |

---

## Phase 1 — Core CRM

**Goal:** Daily field sales operations without web.

### Features

- Auth: password + OTP, register + DPDP, refresh, logout
- Dashboard: KPIs + follow-ups due
- Leads: list, search, filter, detail, create, status, assign
- Tasks: follow-ups full CRUD
- Field capture (“Scanner” form flow)
- Offline: lead + follow-up cache and sync queue
- Profile + settings (basic)
- Push device registration
- App Store / Play Store beta

### APIs (no additions)

`auth/*`, `users/me`, `dashboard/kpis`, `dashboard/followups-due`, `leads/*`, `followups/*`, `agents`, `notifications/devices`

### Success criteria

- 50 beta users complete 100+ lead updates/week
- Sync success rate ≥ 98%
- Crash-free ≥ 99%

### Out of phase

WhatsApp UI, revenue charts, admin screens, AI rescore button

---

## Phase 2 — Customer Success

**Goal:** Communication and team admin.

### Features

- Conversations (WhatsApp send + history)
- Notification inbox + preferences
- Customer 360 layout (lead detail enrichment)
- Meetings view (follow-up channel filter)
- Admin: user list + invite (admin/manager)
- Local follow-up reminders
- Customer-facing polish for GA

### APIs

`whatsapp/*`, `notifications/*`, `admin/users`, `admin/roles`

### Success criteria

- WhatsApp send success ≥ 95% when API configured
- Notification device registration ≥ 90% of active users

---

## Phase 3 — Growth

**Goal:** Manager growth analytics on mobile.

### Features

- Growth Hub screen
- Revenue chart (`range` param)
- Sales performance by agent/territory
- Opportunities / Proposals filtered list UX
- Export share sheet (client-generated PDF summary — no new API)

### APIs

`dashboard/revenue`, `dashboard/sales-performance`

### Success criteria

- Managers open Growth Hub ≥ 3×/week

---

## Phase 4 — AI

**Goal:** Surface existing AI scoring on mobile.

### Features

- Rescore action on lead detail
- Score breakdown UI (`reasons`, `engine` from lead object)
- Label change animations
- “Why this score?” expandable section

### APIs

`POST /leads/{id}/rescore` (existing)

**No new LLM endpoints** — scoring runs server-side `aiScore()` on create/rescore.

### Success criteria

- Rescore used on ≥ 20% of new leads

---

## Phase 5 — Enterprise

**Goal:** Enterprise readiness and placeholders for future APIs.

### Features

- Subscription admin read (`admin/subscriptions`)
- Product access toggles (`admin/product-access`) — admin only
- Certificate pinning enforced
- Optional jailbreak detection
- SSO WebView prep (client shell only — no SSO API in v1)
- **Placeholder screens** for Invoices / Business Registry (disabled “Coming soon”)
- Light mode theme (optional)
- MDM deployment guide

### APIs

`admin/subscriptions`, `admin/product-access`

### Explicitly still out of scope

- Invoice CRUD APIs
- Business registry APIs
- Custom roles POST (not implemented server-side)

---

## Release train

| Milestone | Target |
|-----------|--------|
| Phase 1 internal alpha | T+0 |
| Phase 1 closed beta (TestFlight / Play internal) | T+8 weeks |
| Phase 2 GA | T+14 weeks |
| Phase 3–5 | Quarterly increments |

Dates are planning placeholders — set by Product Owner after approval.

---

## Versioning

- **App version:** `major.minor.patch` (semver)
- **API compatibility:** Pin to OpenAPI tag in `docs/openapi.json` commit hash in release notes
- **Min server version:** Document minimum backend release per app version

---

## Related

- [MOBILE_PRD.md](./MOBILE_PRD.md)
- [MOBILE_SCREEN_BLUEPRINTS.md](./MOBILE_SCREEN_BLUEPRINTS.md)

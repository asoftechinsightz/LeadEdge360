# Sprint 0 — Reuse Catalog

**Date:** 3 August 2026  
**Purpose:** Authoritative reuse map for Epics E-001–E-017 and workstreams  
**Source:** Platform current state + architecture validation  

---

## 1. UI components

| Component | Path | Used by | Reuse for |
|-----------|------|---------|-----------|
| `AeoGrowthEngine.jsx` | `components/aeo/` | `/dashboard`, `/leadedge360` | Agent panel, growth UX |
| `KpiCard.jsx` | `components/dashboard/` | `/leadedge360` | Any KPI row, CS health, executive cards |
| `AppShell.jsx` | `components/layout/` | All application pages | Follow-ups, admin, WA inbox |
| `DashboardHeader.jsx` | `components/layout/` | App pages | New module headers |
| `ProductSwitcher.jsx` | `components/layout/` | App shell | Multi-product nav |
| `app-nav.js` | `components/layout/` | Nav config | Add items only |
| `SiteShell`, `Navbar`, `Footer` | `components/site/` | Marketing | GTM pages |
| `DpdpConsentBanner.jsx` | `components/site/` | Marketing + app | Compliance |
| shadcn subset (13) | `components/ui/` | Tables, dialogs, forms | All new web UIs |
| Inline `Kpi` | `retailedge360/page.js` | Retail only | **Consolidate to KpiCard** (EN) |

**Orphaned (do not reuse without wiring):** `EnterpriseNavigation.jsx`, `WorkspacePlaceholder.jsx`, 36 unused `components/ui/*`.

---

## 2. Hooks

| Hook | Path | Status |
|------|------|--------|
| `use-toast.js` | `hooks/` | Orphaned (shadcn toast dead) |
| `use-mobile.jsx` | `hooks/` | Orphaned (sidebar dead) |

**Recommendation:** Use `sonner` `toast` (already in pages) for new UI — not `use-toast`.

---

## 3. Utilities (`lib/`)

| Module | Exports / role | Reuse for |
|--------|----------------|-----------|
| `mongo.js` | `getDb()` | All data access |
| `tenant.js` | `resolveTenant`, `ensureUserOrg` | E-002 bridge context |
| `auth.js` | Emergent OAuth | Web auth |
| `jwt.js` | sign/verify/refresh | Mobile + bridge |
| `password.js`, `otp.js` | Mobile auth | Web parity (future) |
| `scoring.js` | `aiScore`, `runAeoPrompt` | Agents, campaigns, email AI |
| `retail-ai.js` | `predictShelfLife` | Retail module |
| `razorpay.js` | PLANS, orders, verify | E-005 recurring |
| `whatsapp.js` | `sendWhatsApp` | E-008, campaigns |
| `billing/activate-payment.js` | `activatePaymentSuccess` | E-005 |
| `billing/plan-entitlements.js` | `getEntitlementsForPlan` | **E-004 enforcement** |
| `billing/org-billing.js` | `getOrgBillingContext` | `auth/me` |
| `billing/audit.js` | `writeAuditLog` | Admin, agents |
| `aeo/compute.js` | AEO metrics | Server profile hydrate |
| `aeo/profile.js` | sessionStorage load/save | **E-003 server migration** |
| `aeo/prompts.js` | prompt loader | New agent prompts |
| `aeo/recommendations.js` | rule scanner | CS health, agents |
| `aeo/actions.js` | `invokeAeoPrompt` | Server actions pattern |
| `mobile-routes.js` | full JWT API | **E-002 extract handlers** |
| `utils.js` | `cn()` tailwind merge | All UI |

---

## 4. Mongo collections

| Collection | Epic reuse |
|------------|------------|
| `users` | E-003 preferences, E-007 admin |
| `orgs` | E-004 limits, E-005 billing |
| `leads` | E-004, E-009–E-011, E-015 |
| `lead_activities` | E-009 timeline |
| `follow_ups` | E-006 web UI |
| `whatsapp_messages` | E-008 inbox |
| `notifications`, `push_devices` | E-008, E-016 mobile |
| `payments`, `subscriptions` | E-005 |
| `audit_logs` | E-007, E-013 agents |
| `products` | E-004 retail gate |
| `consent_log` | Compliance |

**Future (PO-approved new):** `campaigns` (E-014), `opportunities`, `documents` (E-015).

---

## 5. Web APIs (`route.js` + mobile)

### Cookie-authenticated (today)

| API | Methods |
|-----|---------|
| `/api` | GET health |
| `/api/auth/*` | login, callback, me, logout, dpdp-consent |
| `/api/agents` | GET |
| `/api/leads/*` | CRUD, status, assign, rescore, sources GET |
| `/api/kpis` | GET |
| `/api/products/*` | CRUD, repredict |
| `/api/retail-kpis` | GET |
| `/api/billing/*` | plans, checkout, verify, status, simulate |
| `/api/webhooks/*` | razorpay, whatsapp, facebook, google |
| `/api/contact` | POST |
| `/api/seed-reset` | POST |

### JWT only (bridge target E-002)

| API root | Key operations |
|----------|----------------|
| `followups` | CRUD, reminders, close |
| `dashboard` | kpis, followups-due, revenue, sales-performance |
| `whatsapp` | send, template, conversation |
| `notifications` | list, devices, settings |
| `admin` | users CRUD, roles GET, subscriptions GET |
| `users` | me PATCH, subscription |

---

## 6. AI prompts (`config/aeo/prompts/`)

| File | Reuse for |
|------|-----------|
| `faq-suggestions.json` | AEO Agent, content |
| `description-improve.json` | Profile, Marketing Agent |
| `review-reply.json` | Review manager |
| `gbp-post.json` | GBP optimization |
| `service-description.json` | Profile |
| `local-page.json` | SEO Agent |
| `social-caption.json` | Social campaigns |
| `whatsapp-outreach.json` | WA Agent, E-008 |

**Rules:** `config/aeo/rules/missing-service-areas.json`, `missing-keywords.json`  
**Checklist:** `readiness-checklist.json`  
**Fields:** `business-profile-fields.json`  
**Defaults:** `defaults.json` (territories, FAQ target, LLM rate)

---

## 7. LLM gateway

| Item | Path |
|------|------|
| Gateway | `lib/scoring.js` — Emergent OpenAI proxy |
| Model | `gpt-4o-mini` |
| Env | `EMERGENT_LLM_KEY` |
| Fallback | `ruleScore()`, retail heuristic |
| Agent extension | Same `runAeoPrompt` / new `runAgentPrompt` pattern |

---

## 8. n8n workflows (`n8n/`)

| File | Reuse for |
|------|-----------|
| `whatsapp-lead-ingest.json` | Lead gen ops |
| `facebook-lead-ingest.json` | Lead gen |
| `google-lead-ingest.json` | Lead gen |
| `whatsapp-followup-automation.json` | E-006 nurture |
| `aeo-profile-reminder.json` | E-003 server profile |
| `aeo-faq-nudge.json` | AEO completeness |
| `aeo-review-reminder.json` | Reviews |

**Pattern:** `ASOFTECH_API` + `X-Webhook-Token` → app webhooks.

---

## 9. Dashboard widgets

| Widget | Location | Data |
|--------|----------|------|
| Executive KPI row | `/dashboard`, leadedge360 | `kpis` |
| AEO 5-KPI + panel | `AeoGrowthEngine` | profile + `kpis` |
| Source/territory/agent charts | `leadedge360` | `kpis.by*` |
| 14-day trend | `leadedge360` | `kpis.trend` |
| Retail risk charts | `retailedge360` | `retail-kpis` |
| Product cards | `/dashboard` | Static links |

---

## 10. Billing components

| Asset | Path |
|-------|------|
| Pricing UI | `app/(marketing)/pricing/page.js` |
| Billing status | `app/(application)/billing/page.js` |
| Success page | `billing/success/page.js` |
| PLANS constant | `lib/razorpay.js` |
| Entitlements | `lib/billing/plan-entitlements.js` |

---

## 11. CRM components

| Asset | Path |
|-------|------|
| Lead table + filters | `leadedge360/page.js` |
| Create lead dialog | Same |
| Lead detail dialog | Same |
| Status pipeline | `STATUSES` in `route.js` |
| WA deep link | Lead row |
| Activity logging | `lead_activities` via API |

---

## 12. Scripts & tests

| Script | Command | Reuse |
|--------|---------|-------|
| `scripts/test-aeo-compute.mjs` | `npm run test:aeo` | E-003 regression |
| `scripts/simulate-billing-flow.mjs` | `npm run test:billing` | E-004, E-005 |

---

## 13. Documentation reuse (execution)

| Doc | Use in Sprint 1 |
|-----|-----------------|
| `03_AUTHENTICATED_VALIDATION_CHECKLIST.md` | E-001 |
| `02_INFRASTRUCTURE_CHECKLIST.md` | E-001 |
| `EXECUTIVE_ACTION_REGISTER.md` | Gate tracking |
| `MOBILE_API_GUIDE.md` | E-002 contract |
| `docs/aeo/README.md` | Freeze scope |

**STOP** — Catalog complete.

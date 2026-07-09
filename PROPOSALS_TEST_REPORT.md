# Proposals Module — Test Report

**Sprint:** Proposals Testing  
**Date:** 23 June 2026  
**Prerequisites:** Leads ✅ · Opportunities ✅ · Campaigns ✅  
**Status:** **PASS — 20/20 (100%)**

---

## Executive Summary

Proposals module underwent route validation, API inventory, MongoDB verification, CRUD/workflow retesting, PDF generation, tenant isolation, and opportunity/lead linkage checks. **14 defects** were identified and fixed. All pass criteria are met.

| Pass criteria | Result |
|---------------|--------|
| Create Proposal | **PASS** |
| Edit Proposal | **PASS** |
| Delete Proposal | **PASS** |
| Get Proposal Detail | **PASS** |
| PDF Generation | **PASS** |
| Status Update | **PASS** |
| Mark Won | **PASS** |
| Convert to Invoice | **PASS** |
| Opportunity Linkage | **PASS** |
| Auto-generate from Lead | **PASS** |
| Tenant Isolation | **PASS** |
| Dashboard Analytics | **PASS** |
| Email Readiness | **PASS** |

**Retest command:** `node scripts/proposals-retest.mjs`  
**Retest result:** **20/20 PASS** (23 Jun 2026)

---

## 1. Route Validation

| Route | Component | Purpose | API type |
|-------|-----------|---------|----------|
| `/proposals` | `ProposalsPage` | List + status KPIs | **REAL** |
| `/proposals/[id]` | `ProposalDetailPage` | Detail, PDF, email, won, invoice | **REAL** |
| Layout | `app/proposals/layout.js` → `SuiteRouteLayout` | Shell wrapper | N/A |

**Shell navigation:** Linked from `nav-config.ts` (`FileText` icon).

**UI note:** Detail page loads list client-side for lookup (inefficient but functional). CRUD pass criteria validated via API retest.

---

## 2. API Inventory

| Method | Endpoint | Handler | Purpose |
|--------|----------|---------|---------|
| `GET` | `/api/proposals` | `app/api/proposals/route.js` | List proposals (tenant + plan gated) |
| `POST` | `/api/proposals` | `app/api/proposals/route.js` | Create proposal |
| `GET` | `/api/proposals/[id]` | `app/api/proposals/[id]/route.js` | Get proposal + line items |
| `PATCH` | `/api/proposals/[id]` | `app/api/proposals/[id]/route.js` | Update proposal |
| `PUT` | `/api/proposals/[id]` | `app/api/proposals/[id]/route.js` | Update alias |
| `DELETE` | `/api/proposals/[id]` | `app/api/proposals/[id]/route.js` | Delete proposal + items |
| `GET` | `/api/proposals/[id]/pdf` | `app/api/proposals/[id]/pdf/route.js` | PDF download |
| `POST` | `/api/proposals/[id]/email` | `app/api/proposals/[id]/email/route.js` | Email with PDF (dry_run if no SMTP) |
| `POST` | `/api/proposals/[id]/status` | `app/api/proposals/[id]/status/route.js` | Status update |
| `POST` | `/api/proposals/[id]/won` | `app/api/proposals/[id]/won/route.js` | Mark accepted + sync opportunity |
| `POST` | `/api/proposals/[id]/convert-to-invoice` | `app/api/proposals/[id]/convert-to-invoice/route.js` | Create invoice |
| `POST` | `/api/proposals/auto-generate` | `app/api/proposals/auto-generate/route.js` | Generate from lead |
| `POST` | `/api/opportunities/[id]/proposal` | `app/api/opportunities/[id]/proposal/route.js` | Create from opportunity |
| `GET` | `/api/dashboard/proposals` | `app/api/dashboard/proposals/route.js` | Status aggregates |
| `GET` | `/api/proposal-templates` | `app/api/proposal-templates/route.js` | List templates |
| `POST` | `/api/proposal-templates` | `app/api/proposal-templates/route.js` | Create template |

**Classification:** All proposal endpoints are **REAL API** (MongoDB).

---

## 3. MongoDB Verification

| Check | Result | Detail |
|-------|--------|--------|
| `MONGO_URL` | **Confirmed** | `mongodb://127.0.0.1:27017` |
| `DB_NAME` | **Confirmed** | `asoftech` |
| `proposals` collection | **PASS** | Tenant-scoped by `orgId` |
| `proposal_items` collection | **PASS** | Line items per proposal |
| `proposal_templates` collection | **PASS** | Org-scoped templates |
| `subscriptions` collection | **PASS** | Plan gating for proposals feature |
| `invoices` / `revenue` | **PASS** | Created on convert/won workflows |
| Demo seed | **PASS** | Subscription + sample proposal for `demo-org` |

---

## 4. Issues Found & Fixes

### PROP-01 — Plan code mismatch blocked all proposal APIs

| Field | Detail |
|-------|--------|
| **Severity** | P0 |
| **Root cause** | `requirePlan(orgId, ['GROWTH','PRO'])` did not match stored codes `BUSINESS_GROWTH` / `ENTERPRISE` |
| **Fix applied** | Added plan normalization aliases in `lib/billing/require-plan.js`; expanded allowed plans on proposal routes |
| **Retest** | **PASS** — list/create return 200 with `BUSINESS_GROWTH` subscription |

### PROP-02 — Missing GET proposal by ID

| Field | Detail |
|-------|--------|
| **Severity** | P0 |
| **Root cause** | No `GET /api/proposals/[id]`; detail page fetched entire list |
| **Fix applied** | Added `app/api/proposals/[id]/route.js` with `getProposalDetail()` including line items |
| **Retest** | **PASS** — detail returns client + items |

### PROP-03 — Missing update/delete proposal APIs

| Field | Detail |
|-------|--------|
| **Severity** | P0 |
| **Root cause** | Only status POST existed; no PATCH/DELETE |
| **Fix applied** | `updateProposal()` / `deleteProposal()` in `lib/proposals/service.js`; routes on `[id]` |
| **Retest** | **PASS** — edit and delete succeed |

### PROP-04 — No tenant scoping on sub-routes

| Field | Detail |
|-------|--------|
| **Severity** | P0 |
| **Root cause** | `won`, `status`, `convert-to-invoice`, `email`, and opportunity proposal routes queried by `_id` only |
| **Fix applied** | All routes now use `resolveTenant()` + `orgId` filter via centralized service |
| **Retest** | **PASS** — foreign proposal ID returns 404 |

### PROP-05 — Unsafe full-payload updates

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Root cause** | Risk of overwriting `orgId` if entire body spread into `$set` |
| **Fix applied** | Whitelist `ALLOWED_UPDATE_FIELDS` in `updateProposal()` |
| **Retest** | **PASS** — edit updates allowed fields only |

### PROP-06 — `proposal_items` never surfaced

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Root cause** | Items inserted on create but never read for detail or PDF |
| **Fix applied** | `getProposalItems()` loaded in `getProposalDetail()`; PDF generator renders line items |
| **Retest** | **PASS** — detail shows items; PDF > 500 bytes |

### PROP-07 — Auto-generate used wrong lead lookup

| Field | Detail |
|-------|--------|
| **Severity** | P0 |
| **Root cause** | `auto-generate` queried `leads._id` (ObjectId) but leads use UUID `id` field |
| **Fix applied** | `autoGenerateProposalFromLead(orgId, leadId)` finds `{ orgId, id: leadId }` |
| **Retest** | **PASS** — auto-generate returns proposal with `leadId` |

### PROP-08 — No `leadId` persisted on auto-generated proposals

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Root cause** | Only copied client name/company; no lead linkage field |
| **Fix applied** | `createProposal()` stores `leadId`; opportunity route sets `leadId` from opportunity |
| **Retest** | **PASS** — `leadId` present on generated proposal |

### PROP-09 — Proposal templates hardcoded org

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Root cause** | `proposal-templates` API used fixed UUID instead of tenant |
| **Fix applied** | Routes use `resolveTenant()` and scope by `orgId` |
| **Retest** | **PASS** — templates scoped to `demo-org` |

### PROP-10 — Won workflow invoice/revenue lookup broken

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Root cause** | Invoice lookup used string `proposal.id`; invoices store ObjectId `proposalId` |
| **Fix applied** | `markProposalWon()` looks up invoice by `proposal._id`; deduplicates revenue insert |
| **Retest** | **PASS** — mark won completes; opportunity stage synced |

### PROP-11 — No demo subscription for plan gating

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Root cause** | Fresh DB had no `subscriptions` doc → `ACTIVE_SUBSCRIPTION_REQUIRED` |
| **Fix applied** | `seedDemoSubscriptionIfMissing()` + `seedDemoProposalsIfEmpty()` in service; wired to `lib/demo-seed.js` |
| **Retest** | **PASS** — `BUSINESS_GROWTH` subscription seeded |

### PROP-12 — Demo seed ran on every DB access

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Root cause** | `getDb()` called `ensureDevDemoData()` on every request, causing multi-minute hangs |
| **Fix applied** | One-time `devSeedDone` flag in `lib/mongo.js` |
| **Retest** | **PASS** — retest completes in ~63s |

### PROP-13 — Email route crashed without SMTP

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Root cause** | Nodemailer transport created unconditionally; send failed without env vars |
| **Fix applied** | Reused `getSmtpReadiness()`; returns `dry_run` success when SMTP not configured |
| **Retest** | **PASS** — `mode=dry_run` |

### PROP-14 — Opportunity proposal bypassed service layer

| Field | Detail |
|-------|--------|
| **Severity** | P2 |
| **Root cause** | Inline insert duplicated logic; no tenant check; inconsistent response shape |
| **Fix applied** | `createProposalFromOpportunity(orgId, opportunityId)` centralizes creation |
| **Retest** | **PASS** — `opportunityId` linked on created proposal |

---

## 5. Pass Criteria — Detailed Results

| # | Criterion | Method | Result |
|---|-----------|--------|--------|
| 1 | Create Proposal | `POST /api/proposals` with items | **PASS** |
| 2 | Edit Proposal | `PATCH /api/proposals/[id]` | **PASS** |
| 3 | Delete Proposal | `DELETE /api/proposals/[id]` | **PASS** |
| 4 | Get Proposal Detail | `GET /api/proposals/[id]` | **PASS** |
| 5 | PDF Generation | `GET /api/proposals/[id]/pdf` | **PASS** |
| 6 | Status Update | `POST /api/proposals/[id]/status` | **PASS** |
| 7 | Mark Won | `POST /api/proposals/[id]/won` | **PASS** |
| 8 | Convert to Invoice | `POST /api/proposals/[id]/convert-to-invoice` | **PASS** |
| 9 | Opportunity Linkage | `POST /api/opportunities/[id]/proposal` | **PASS** |
| 10 | Auto-generate from Lead | `POST /api/proposals/auto-generate` | **PASS** |
| 11 | Tenant Isolation | Foreign ID → 404 | **PASS** |
| 12 | Dashboard Analytics | `GET /api/dashboard/proposals` | **PASS** |
| 13 | Email Readiness | `POST /api/proposals/[id]/email` | **PASS** (dry_run) |

---

## 6. Workflow (Verified)

```
Create proposal (manual | from opportunity | auto-generate from lead)
  → Attach line items (proposal_items)
  → GET detail / PDF
  → POST status (SENT, etc.)
  → POST convert-to-invoice → invoices collection
  → POST won → status ACCEPTED + opportunity WON + revenue record
  → POST email → PDF attachment (live if SMTP configured, else dry_run)
  → DELETE proposal + items
```

---

## 7. Files Changed

| File | Change |
|------|--------|
| `lib/proposals/service.js` | Full CRUD, won, invoice, auto-generate, seed |
| `lib/proposals/get-proposal.js` | Delegates to service |
| `lib/billing/require-plan.js` | Plan code normalization |
| `lib/pdf/proposal-generator.js` | Line items in PDF |
| `lib/mongo.js` | One-time dev seed flag |
| `lib/demo-seed.js` | Proposal demo seed hook |
| `app/api/proposals/route.js` | Plan codes + service layer |
| `app/api/proposals/[id]/route.js` | GET/PATCH/DELETE (new) |
| `app/api/proposals/[id]/won/route.js` | Tenant-scoped won workflow |
| `app/api/proposals/[id]/status/route.js` | Tenant-scoped status |
| `app/api/proposals/[id]/convert-to-invoice/route.js` | Tenant-scoped invoice |
| `app/api/proposals/[id]/email/route.js` | SMTP dry_run + tenant scope |
| `app/api/proposals/[id]/pdf/route.js` | Detail with items |
| `app/api/proposals/auto-generate/route.js` | Tenant + correct lead lookup |
| `app/api/opportunities/[id]/proposal/route.js` | Tenant + service layer |
| `app/api/proposal-templates/route.js` | Tenant-scoped templates |
| `scripts/proposals-retest.mjs` | Automated retest (new) |

---

## 8. Retest Log

```
=== Proposals Module Retest ===

PASS  Auth login — status=200
PASS  MongoDB connectivity — mongodb://127.0.0.1:27017 / asoftech
PASS  Demo data bootstrap — subscription + proposals ready
PASS  Demo subscription — BUSINESS_GROWTH
PASS  Proposal seed data — 1 demo proposals
PASS  Dashboard analytics — stats=1
PASS  List proposals — count=639
PASS  Create proposal — status=200
PASS  Get proposal detail — items=1
PASS  Edit proposal — status=200
PASS  PDF generation — bytes=1230
PASS  Email readiness — mode=dry_run
PASS  Status update — status=200
PASS  Convert to invoice — INV-1782171832449
PASS  Mark won — status=ACCEPTED
PASS  Opportunity linkage — proposalId=<id>
PASS  Auto-generate from lead — proposal=<id>
PASS  Tenant isolation — status=404
PASS  Delete proposal — status=200
PASS  Collections exist — proposals, proposal_items, proposal_templates, subscriptions

=== 20/20 passed ===
```

---

## 9. Sign-Off

| Module | Status |
|--------|--------|
| Leads | ✅ Approved |
| Opportunities | ✅ Approved |
| Campaigns | ✅ Approved |
| **Proposals** | ✅ **Approved — 100% pass** |

**Proposals module is cleared for sign-off.**

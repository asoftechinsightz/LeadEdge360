# Tenant Expansion Readiness

**Version:** 1.0  
**Scope:** Criteria to expand from **Tenant #1 pilot** to **Tenant #2+**  
**Evidence base:** Documented ops/runtime/CS packs only — no invented readiness claims.

**Current expansion decision:** **NOT READY** for multi-tenant commercial rollout until Tenant #1 evidence exists and open infra items close.

---

## 1. Technical Readiness

| Criterion | Required evidence | Current status | Source |
|-----------|-------------------|----------------|--------|
| Production HTTPS stable | `/api/health` `ok: true` | **Observed** (03 Aug 04:24 UTC) | API probe |
| Mongo connected | `database.ok: true` | **Observed** | `/api/health` |
| Git SHA / Docker image confirmed | Ops checklist | **Open** | `runtime-handover/02` SSH blocked |
| Deploy matches AEO RC | Container `docker exec` | **Unconfirmed** | Reconciliation matrix |
| `/billing` or alternate checkout | 200 or PO removes from scripts | **404 on live** | HTTP probe 2 Aug |
| Razorpay keys | `checkoutEnabled: true` | **False** | `/api/health` |
| SMTP | `smtp.ready: true` | **False** (dry_run) | `/api/health` |
| `EMERGENT_LLM_KEY` (if AI SLA) | Env grep on VPS | **Not verified** | Infra checklist |
| n8n ingest flows active | Ops smoke | **NOT CAPTURED** for Tenant #1 | POST_DEPLOY_CHECKLIST §5 |
| Multi-tenant isolation | Tenant-scoped `orgId` in API | **Designed** in code | `route.js` — not load-tested at scale |

**Technical gate:** **NOT READY** — infra parity + billing + optional LLM unresolved.

---

## 2. Customer Success Readiness

| Criterion | Required evidence | Current status |
|-----------|-------------------|----------------|
| Onboarding kit | Published | **Complete** — `CUSTOMER_ONBOARDING_KIT.md` |
| CS playbook + health model | Published | **Complete** |
| Training academy | Published | **Complete** — `TRAINING_ACADEMY.md` |
| Tenant #1 authenticated validation PASS | WS3 signed | **PENDING** |
| Tenant #1 success dashboard populated | Real KPIs weekly | **NOT CAPTURED** |
| CS certified on platform | Training checklist | **NOT CAPTURED** |
| 30-day Tenant #1 outcomes | Commercial toolkit | **NOT CAPTURED** |
| Escalation runbook tested | Ticket log | **NOT CAPTURED** |

**CS gate:** **NOT READY** — Tenant #1 execution not validated.

---

## 3. Commercial Readiness

| Criterion | Required evidence | Current status |
|-----------|-------------------|----------------|
| Pricing sheet + plans | `/pricing` + marketing assets | **Complete** (docs) |
| Self-serve checkout | Razorpay live | **Not configured** on pilot |
| Pilot agreement template | Legal/PO | **NOT CAPTURED** in repo |
| Tenant #1 ROI worksheet | Commercial toolkit | **NOT CAPTURED** |
| Testimonials / case study | Commercial toolkit | **NOT CAPTURED** |
| NPS / renewal intent | Commercial toolkit | **NOT CAPTURED** |
| Sales playbook | Published | **Complete** |

**Commercial gate:** **NOT READY** — no Tenant #1 commercial evidence; checkout blocked.

---

## 4. Support Readiness

| Criterion | Required evidence | Current status |
|-----------|-------------------|----------------|
| Support email | `contactEmail` on health API | **Observed** — Enquiry@asoftechinsightz.com |
| Escalation matrix | CS playbook | **Complete** |
| P1 on-call / ops runbook | POST_DEPLOY + runtime-handover | **Complete** (docs) |
| Tenant #1 support tickets | Ticket system | **NOT CAPTURED** |
| Status page | POST_DEPLOY §10 | **NOT CAPTURED** |

**Support gate:** **READY WITH CONDITIONS** — docs exist; no live support volume data.

---

## 5. Operational Readiness

| Criterion | Required evidence | Current status |
|-----------|-------------------|----------------|
| VPS SSH inventory | Infra checklist complete | **Incomplete** (2 Aug) |
| Monitoring | `/api/metrics` + health | **Observed** — metrics endpoint live |
| Active tenant/user counts | Metrics | **0** (03 Aug) — no validated tenant activity in probe |
| Backup / DR | POST_DEPLOY §9 | **NOT CAPTURED** in this pass |
| Expansion provisioning process | Ops SOP | **NOT CAPTURED** — use POST_DEPLOY admin seed pattern |

**Operational gate:** **NOT READY** — SSH/deploy traceability open.

---

## Expansion decision matrix

| Gate | Ready? |
|------|--------|
| Technical | **No** |
| Customer Success | **No** |
| Commercial | **No** |
| Support | **Conditional** |
| Operational | **No** |

**Recommended:** Complete Tenant #1 pilot execution (auth validation → weekly metrics → 30-day commercial pack) **before** Tenant #2 contract.

---

## Tenant #2 kickoff prerequisites (checklist)

- [ ] All rows in `EXECUTIVE_ACTION_REGISTER.md` P1–P2 closed or accepted  
- [ ] `TENANT1_SUCCESS_DASHBOARD.md` ≥ 4 weeks of captured KPIs  
- [ ] `CUSTOMER_HEALTH_MODEL.md` tier **Healthy** or **At Risk** with remediation plan  
- [ ] PO sign-off on `PO_CUSTOMER_READINESS_REPORT.md` → upgrade to READY FOR CUSTOMER ONBOARDING  
- [ ] Ops: new tenant provisioned per `POST_DEPLOY_CHECKLIST.md` §4  

**Related:** `PO_CUSTOMER_READINESS_REPORT.md` · `EXECUTIVE_ACTION_REGISTER.md`

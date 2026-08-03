# AEO Release Impact Assessment — LeadEdge360

**Version:** 1.0  
**Assessment type:** Pre-implementation impact analysis (documentation phase)  
**Product freeze:** Active  

---

## 1. Summary

| Dimension | Impact level | Notes |
|-----------|--------------|-------|
| API contracts | **None** | No new routes; no response shape changes required |
| Database | **None** | Metadata in existing JSON fields only |
| Navigation | **None** | AEO on `/dashboard` and `/leadedge360` only |
| Architecture | **None** | No new services or modules |
| Authentication | **None** | Same Emergent + JWT flows |
| Backward compatibility | **High** | Additive UI rows and config files |
| Risk | **Low–Medium** | LLM dependency, web preferences write gap |

**Verdict:** AEO enablement is **compatible with product freeze** when implemented as configuration + dashboard composition + prompt templates only.

---

## 2. Change inventory (allowed)

| Category | Files / artifacts | Risk |
|----------|-------------------|------|
| Config | `config/aeo/**` | Low |
| Prompt templates | JSON in config | Low |
| Dashboard UI | `dashboard/page.js`, optional `leadedge360/page.js` | Low |
| Shared KpiCard | Extract to component (optional) | Low |
| LLM prompts | `lib/scoring.js` string load from config | Medium — test scoring regression |
| n8n | New workflow JSON files | Low |
| User preferences | `preferences.aeoProfile` writes via mobile API | Medium for web cookie users |
| Documentation | `docs/aeo/**` | None |

---

## 3. Forbidden changes (must not ship)

| Item | Verification |
|------|--------------|
| New API routes | OpenAPI diff empty |
| New Mongo collections | No new `db.collection('...')` |
| New SQL tables | No DDL in migrations |
| Route groups / pages | No `app/(aeo)` |
| Sidebar / navbar entries | `app-nav.js` unchanged |
| Auth middleware changes | `tenant.js`, `jwt.js` logic unchanged |
| Billing / subscription logic | Unchanged |

---

## 4. Backward compatibility

### 4.1 API consumers

| Consumer | Impact |
|----------|--------|
| Mobile app | No change if preferences schema extended additively |
| n8n ingest webhooks | No change |
| Postman collection | No change |
| OpenAPI spec | No change |

### 4.2 Existing UI

| Page | Impact |
|------|--------|
| `/leadedge360` CRM table/charts | Unchanged below AEO strip |
| `/dashboard` product cards | Unchanged |
| Marketing site | No AEO references required |
| Billing flow | Isolated |

### 4.3 Data

| Store | Impact |
|-------|--------|
| `leads` documents | No schema change; optional future `meta.aeo` per lead — not required for v1 |
| `orgs` | Optional nested keys only if written via existing admin paths |
| `users.preferences` | Additive `aeoProfile` key |

---

## 5. Dependency impacts

| Dependency | AEO usage | Failure mode |
|------------|-----------|--------------|
| `EMERGENT_LLM_KEY` | Recommendations + content | Rule-based fallback |
| n8n | Reminder automations | Manual follow-ups |
| WhatsApp API | Content delivery | Clipboard only |
| `GET /api/kpis` | Local visibility | Show “—” |

---

## 6. Performance impact

| Area | Impact |
|------|--------|
| Dashboard load | +0 API calls if AEO derived from same `kpis` fetch |
| LLM calls | On-demand only; user-triggered |
| Bundle size | +config JSON ~50KB |
| Mongo | Preferences document size increase minimal |

---

## 7. Security & compliance

| Topic | Assessment |
|-------|------------|
| PII in preferences | Business profile public data — not lead PII |
| DPDP | Marketing consent unchanged |
| Tenant isolation | JWT `tenantId` scopes preferences per user/org |
| LLM data residency | Emergent API — document in privacy addendum |

---

## 8. Testing impact

| Suite | New cases |
|-------|-----------|
| Unit | `computeAeoScore`, checklist weights |
| Integration | KPI fetch + preferences PATCH |
| E2E | Dashboard shows 5 AEO cards |
| Regression | Lead scoring unchanged when AEO prompts separate |

See [MOBILE_TEST_STRATEGY.md](../mobile/MOBILE_TEST_STRATEGY.md) — no mobile change required for web-only AEO v1.

---

## 9. Rollout plan

| Stage | Action |
|-------|--------|
| 1 | Ship config + docs (this package) |
| 2 | Staging: dashboard composition behind feature flag `AEO_ENABLED` (env only) |
| 3 | Internal dogfood on demo org |
| 4 | Production: enable flag for pilot tenants |
| 5 | Import n8n AEO workflows |

**Feature flag:** `NEXT_PUBLIC_AEO_ENABLED` — client-only, no API.

---

## 10. Rollback

| Action | Effect |
|--------|--------|
| Disable env flag | AEO row hidden; CRM unchanged |
| Revert dashboard JSX | Immediate |
| Remove config folder | No runtime effect if not imported |
| Revert scoring prompt load | Restore inline prompt string |

No data migration rollback needed.

---

## 11. Known gaps (documented, not blockers)

| Gap | Mitigation |
|-----|------------|
| No reviews API | Manual metadata in preferences |
| Web cookie users cannot `PATCH /users/me` | SessionStorage interim or mobile app for profile edit |
| Notifications writer incomplete | Use follow-ups for reminders |
| No GBP publish API | Copy/paste workflow |

---

## 12. Sign-off criteria

- [ ] Product Owner approves documentation package
- [ ] Engineering confirms zero OpenAPI diff
- [ ] QA signs regression on `/leadedge360` KPI row
- [ ] Ops approves n8n workflow additions

---

## Related

- [AEO_IMPLEMENTATION_READINESS_REPORT.md](./AEO_IMPLEMENTATION_READINESS_REPORT.md)

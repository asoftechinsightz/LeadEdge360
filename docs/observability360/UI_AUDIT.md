# Observability360 — UI Audit

**Date:** 3 July 2026  
**Total pages:** 74 (`app/**/page.js`)  
**Component folders:** 19 + design-system

---

## 1. Page Inventory by Area

### Marketing / Public (22 pages)
| Page | Status | Reusable | Design | Responsive | Notes |
|------|--------|----------|--------|------------|-------|
| `/` | ✅ Complete | YES | 90% | ✅ | Marketing home |
| `/products`, `/solutions` | ✅ | YES | 88% | ✅ | Product positioning |
| `/pricing`, `/book-demo` | ✅ | YES | 85% | ✅ | Conversion |
| `/growth-audit` | ✅ | Partial | 80% | ✅ | Lead gen tool |

### Auth & Onboarding (9 pages)
| Page | Status | Reusable | Design | Notes |
|------|--------|----------|--------|-------|
| `/signin`, `/signup` | ✅ | YES | 90% | Production |
| `/onboarding` | ✅ | YES | 85% | Tenant setup |
| `/login` | ⚠️ Duplicate | Merge with `/signin` | — | Tech debt |

### Suite CRM (15 pages)
| Page | Status | Reusable | Design | Missing |
|------|--------|----------|--------|---------|
| `/dashboard` | ✅ | YES | 88% | Real-time widgets |
| `/leads`, `/leads/[id]` | ✅ | YES | 90% | — |
| `/campaigns`, `/proposals` | ✅ | YES | 85% | — |
| `/analytics` | ✅ | Partial | 80% | Business analytics only |
| `/settings` | ✅ | YES | 82% | — |

### LeadEdge360 (13 pages)
| Page | Status | Reusable | Design |
|------|--------|----------|--------|
| `/leadedge360/command-center` | ✅ | YES | 88% |
| `/leadedge360/conversations` | 🟡 | Partial | 75% — mock data areas |
| `/leadedge360/geo-finder` | ✅ | YES | 85% |
| `/leadedge360/reports` | ✅ | YES | 82% |

### Ops / Platform (5 pages) — **Closest to Observability360**
| Page | Status | Reusable | Design | Gap |
|------|--------|----------|--------|-----|
| `/ops/events` | ✅ | **YES** | 80% | Not infra events |
| `/ops/ai-analytics` | ✅ | Partial | 78% | AI not infra metrics |
| `/ops/ai-timeline` | ✅ | Partial | 78% | Agent timeline |
| `/ops/agents` | ✅ | Partial | 75% | — |

### Growth Tools (3 pages)
| Page | Status | Reusable |
|------|--------|----------|
| `/growth/business-card` | ✅ | YES |
| `/growth/qr` | ✅ | YES |
| `/growth/reviews` | 🟡 | Partial |

### Portal & Partners (5 pages)
| Page | Status | Reusable |
|------|--------|----------|
| `/portal/*` | 🟡 Scaffold | Partial |
| `/partners/dashboard` | 🟡 | Partial |

### **Observability360 (planned)**
| Page | Status | Reusable source |
|------|--------|-----------------|
| `/observability360` | ❌ Planned | Trinetra360 `/` executive |
| `/observability360/discovery` | ❌ | Trinetra360 — none yet |
| `/observability360/cmdb` | ❌ | `/cmdb` |
| `/observability360/topology` | ❌ | `/twin` |
| `/observability360/metrics` | ❌ | `/observability` |
| `/observability360/logs` | ❌ | Build |
| `/observability360/traces` | ❌ | Build |
| `/observability360/alerts` | ❌ | Build |
| `/observability360/banking360` | ❌ | Sprint 8 |

---

## 2. Component Library

| Folder | Quality | Reuse for Observability360 |
|--------|---------|---------------------------|
| `design-system/` | 90% | **Primary** — DataGrid, Card, Modal |
| `suite/` | 88% | AppShell, sidebar, auth context |
| `business-suite/` | 85% | Product switcher — add Observability360 |
| `leadedge360/` | 82% | Dashboard patterns |
| `ops/` | 75% | Ops command center patterns |
| `gix/` | 85% | Marketing only |

**Trinetra360 reuse:** `Observability360/apps/web` — `DashboardShell`, KPI cards, Cytoscape twin, domain pages.

---

## 3. Design Quality Assessment

| Criterion | Score | Notes |
|-----------|-------|-------|
| Visual consistency | 85% | Design tokens + Tailwind |
| Dark mode | 80% | Suite pages |
| Data density | 75% | Enterprise tables good |
| Empty states | 70% | Inconsistent |
| Loading states | 65% | Improve for observability dashboards |
| Error boundaries | 60% | Partial |

---

## 4. Accessibility & Responsive

| Criterion | Status |
|-----------|--------|
| Mobile responsive | ✅ Marketing + public cards |
| Keyboard navigation | ⚠️ Partial in data grids |
| ARIA labels | ⚠️ Incomplete |
| Color contrast | ✅ Design system compliant |
| Screen reader | ⚠️ Not audited |

---

## 5. Performance

| Area | Finding |
|------|---------|
| Next.js SSR/SSG | Marketing SSG, suite dynamic |
| Bundle size | Large — enterprise modules |
| Chart rendering | Recharts — acceptable |
| Real-time updates | Limited — polling only |

**Observability360 need:** WebSocket or SSE for live metrics; Trinetra360 uses 30s revalidate.

---

## 6. Missing UI Components (Observability360)

- Topology graph viewer (Cytoscape — exists in Trinetra360)
- Time-series metric charts (multi-series)
- Log tail / search viewer
- Trace waterfall / span tree
- Alert timeline + ack workflow
- Agent deployment status panel
- CMDB CI detail drawer
- Discovery connector wizard
- Executive observability dashboard (CIO view)

---

## 7. UI Audit Conclusion

| Area | Reusable | Action |
|------|----------|--------|
| App shell + auth | **YES** | Extend product switcher |
| Ops pages | **Partial** | Refactor to infra observability |
| Design system | **YES** | Build observability components |
| Observability360 pages | **NO** | Port Trinetra360 web pages |
| Banking360 UI | **NO** | Sprint 8 |

**Do not redesign from scratch** — extend `DashboardShell` pattern from Trinetra360 and `suite/` from Business Suite.

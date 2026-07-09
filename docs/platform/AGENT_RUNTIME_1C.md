# Phase 1C — Production Integration & Enterprise Validation

Phase 1C integrates the Agent Runtime with live LeadEdge360 business workflows and validates production readiness.

## What's New

| Area | Implementation |
|------|----------------|
| Org AI settings | `org_ai_settings` + `/settings` → AI Workforce tab |
| Industry profiles | 9 profiles in `lib/agents/industry-profiles.js` |
| Cost management | `lib/agents/cost-management.js` + `/api/agents/usage` |
| Workforce analytics | `lib/agents/workforce-analytics.js` + `/ops/ai-analytics` |
| Marketplace foundation | `lib/agents/marketplace/manifest.js` |
| Disaster recovery | `lib/agents/disaster-recovery.js` + `/api/agents/recovery` |
| Workflow events | `task.created`, `followup.created`, `document.uploaded` |

## Org AI Settings

Each organization configures via **Settings → AI Workforce**:

- Enable/disable AI workforce
- Per-agent: enabled, auto-run, approval required
- Model selection (`gpt-4o-mini`, `gpt-4o`)
- Confidence threshold
- Daily execution limit
- Monthly token/cost budget
- Business hours restriction
- Industry profile application

API: `GET/PUT /api/agents/settings`

## Industry Profiles

| Profile | Key Agents |
|---------|------------|
| BFSI | Finance, Revenue Intel, Churn |
| Healthcare | Customer Success, Document AI |
| Manufacturing | Proposal, Sales, Finance |
| Retail | Marketing, Geo Scanner |
| IT Services | Full sales stack + CEO AI |
| Real Estate | Geo Scanner, Meeting Scheduler |
| Government | Document AI, Compliance (high approval) |

API: `GET/POST /api/agents/industry-profiles`

## Cost & Usage

Tracked in `agent_token_usage` by org, agent, department, user:

- Token usage and estimated cost
- Success rate and avg duration
- Monthly budget enforcement in dispatch
- Approval rate metrics

API: `GET /api/agents/usage`

## Workforce Analytics

Dashboard at `/ops/ai-analytics`:

- Human vs AI task ratio
- Leads qualified, proposals generated
- Revenue influenced
- Per-agent performance and cost

API: `GET /api/agents/analytics`

## AI Marketplace Foundation

Packages include manifest with: id, version, skills, permissions, tools, events, config schema.

- Core 12 agents: `core: true`, not uninstallable
- Future packages: Compliance AI, Renewal AI (`installable: true`)

API: `GET/POST /api/agents/marketplace`

## Disaster Recovery

| Procedure | API Action |
|-----------|------------|
| Retry failed tasks | `retry_tasks` |
| Replay failed webhooks | `replay_webhooks` |
| Rebuild agent memory | `rebuild_memory` |
| Rebuild notifications | `rebuild_notifications` |
| Full outage recovery | `recover_outage` |

API: `GET/POST /api/agents/recovery`

## Production Validation

Run end-to-end validation:

```bash
node scripts/agent-runtime-retest.mjs
```

Tests: registry, settings, industry profiles, marketplace, lead→agent dispatch, events, analytics, DR runbook.

## Tenant Isolation

All collections are org-scoped:

- `org_ai_settings`
- `org_industry_profile`
- `org_agent_packages`
- `org_approval_rules`
- `agent_memory`, `agent_tasks`, `agent_token_usage`

No cross-tenant data sharing unless explicitly configured.

See also: [PRODUCTION_READINESS_REPORT.md](./PRODUCTION_READINESS_REPORT.md)

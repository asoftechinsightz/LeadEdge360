# Phase 1 — Agent Runtime Platform

**Status:** Implemented  
**Depends on:** Phase 0 Event Platform (`docs/platform/EVENT_PLATFORM.md`)  
**Phase 1B Hardening:** See [`AGENT_RUNTIME_1B.md`](./AGENT_RUNTIME_1B.md)  
**Phase 1C Production:** See [`AGENT_RUNTIME_1C.md`](./AGENT_RUNTIME_1C.md) · [Production Readiness Report](./PRODUCTION_READINESS_REPORT.md)

---

## Overview

The Agent Runtime Platform enables **12 Agentic AI employees** to subscribe to platform events, execute tasks, emit audit trails, and surface in the unified activity feed.

```
Platform Event
      ↓
agent_runtime processor
      ↓
agent_tasks (queue)
      ↓
Agent Handler → executeAgentTask()
      ↓
agent.action + agent.task.completed events
      ↓
Activity feed · AI timeline · Audit log
```

---

## 12 MVP AI Employees

| ID | Name | Role | Auto-run | Approval |
|----|------|------|----------|----------|
| lead-qualification-ai | Lead Qualification AI | Sales | ✓ | — |
| proposal-ai | Proposal AI | Sales | — | ✓ |
| sales-ai | Sales AI | Sales | ✓ | — |
| marketing-ai | Marketing AI | Marketing | ✓ | — |
| customer-success-ai | Customer Success AI | Support | ✓ | — |
| finance-ai | Finance AI | Finance | ✓ | — |
| revenue-intelligence-ai | Revenue Intelligence AI | Finance | ✓ | — |
| geo-scanner-ai | Geo Scanner AI | Marketing | ✓ | — |
| meeting-scheduler-ai | Meeting Scheduler AI | Sales | — | ✓ |
| churn-prediction-ai | Churn Prediction AI | Support | ✓ | — |
| ceo-ai | CEO AI | Executive | ✓ | — |
| document-ai | Document AI | Operations | — | ✓ |

Registry: `lib/agents/registry.js`

---

## Task lifecycle

| Status | Description |
|--------|-------------|
| queued | Waiting for worker |
| running | Handler executing |
| awaiting_approval | Human-in-the-loop gate |
| completed | Success |
| failed | Error (retry via DLQ or manual) |

Collection: `agent_tasks`

---

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents` | GET | Registry + runtime status |
| `/api/agents/tasks` | GET | List tasks (filter by agent, status) |
| `/api/agents/tasks/{id}/run` | POST | Manual run |
| `/api/agents/tasks/{id}/approve` | POST | Approve human-gated task |
| `/api/agents/worker/run` | POST | Process queued tasks |

---

## UI

| Page | Path |
|------|------|
| Agent Runtime | `/ops/agents` |
| AI Operations | `/ops/ai` |
| AI Agent Timeline | `/ops/ai-timeline` |

---

## Triggering agents

Create a lead — `lead.created` event automatically:

1. Dispatches Lead Qualification AI (scores lead via LLM/rules)
2. Dispatches Sales AI (follow-up cadence)
3. Dispatches Meeting Scheduler AI (queued for approval if hot)

```bash
# Process any queued tasks manually
curl -X POST /api/agents/worker/run -H "Authorization: Bearer ..."
```

---

## Key files

| Path | Purpose |
|------|---------|
| `lib/agents/registry.js` | 12-agent canonical registry |
| `lib/agents/dispatch.js` | Event → task dispatch |
| `lib/agents/executor.js` | Task execution + event emission |
| `lib/agents/handlers/index.js` | Per-agent business logic |
| `lib/agents/service.js` | Task CRUD, queue worker |
| `lib/events/processors.js` | `agent_runtime` projection |

---

## Deploy

```bash
node scripts/mongo-indexes.mjs
npm run build
```

---

## Next (Phase 1b)

- Wire remaining platform event emitters (opportunity, campaign, invoice)
- n8n webhook triggers from `agent.task.completed`
- Per-agent LLM prompts and tool calling
- Cost tracking per agent run

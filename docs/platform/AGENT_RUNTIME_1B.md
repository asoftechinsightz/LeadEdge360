# Agent Runtime — Phase 1B Hardening

Phase 1B strengthens the Agent Runtime into the permanent execution platform for all current and future AI employees.

## Architecture Overview

```
Business Action → emitPlatformEvent() → platform_events
                                              ↓
                                    Event Processors
                                    (activities, notifications,
                                     analytics, ai_memory,
                                     search_index, agent_runtime)
                                              ↓
                              dispatchAgentTasks() → agent_tasks
                                              ↓
                              executeAgentTask() → Skills → Tools
                                              ↓
                         agent.action / agent.task.completed / lifecycle events
                                              ↓
                              n8n Webhook Publisher (external automation)
```

## Components

| Module | Path | Purpose |
|--------|------|---------|
| Event types | `lib/events/types.js` | Canonical platform event constants |
| Emit helpers | `lib/events/emit-helpers.js` | Standardized business event emission |
| Tool registry | `lib/agents/tools/registry.js` | Approved tools (CRM search, email, etc.) |
| Tool executor | `lib/agents/tools/executor.js` | Permission-checked tool invocation |
| Skill registry | `lib/agents/skills/registry.js` | Composable skill modules |
| Approval engine | `lib/agents/approval.js` | Configurable approval rules per org |
| Agent memory | `lib/agents/memory.js` | Layered tenant-isolated memory |
| Collaboration | `lib/agents/collaboration.js` | Delegation via event bus + task queue |
| Security | `lib/agents/security.js` | Least-privilege per agent |
| Observability | `lib/agents/observability.js` | Runtime metrics and token tracking |
| n8n integration | `lib/integrations/n8n.js` | Webhook publisher for external automation |

## Agent Lifecycle Events

| Event | When |
|-------|------|
| `agent.started` | Task begins execution |
| `agent.waiting` | Awaiting human approval |
| `agent.completed` | Task finished successfully |
| `agent.failed` | Task failed with error |
| `agent.escalated` | Delegated to another agent |
| `agent.delegate.requested` | Collaboration request on event bus |
| `agent.task.completed` | Full task completion (triggers n8n) |

## Tool Calling Framework

Agents **must not** query databases directly. They invoke approved tools:

```javascript
import { invokeAgentTool } from '@/lib/agents/tools/executor'

const result = await invokeAgentTool(db, {
  orgId,
  agentId: 'lead-qualification-ai',
  toolId: 'lead_search',
  params: { query: 'Acme Corp' },
  taskId: task.id,
})
```

Permission checks run via `lib/agents/security.js` before every tool call.

## Skill Composition

Skills compose one or more tools:

```javascript
import { runSkill } from '@/lib/agents/skills'

const result = await runSkill(db, {
  orgId,
  agentId: 'proposal-ai',
  skillId: 'proposal_writing',
  params: { opportunityId },
  taskId: task.id,
})
```

Available skills: lead_analysis, opportunity_analysis, revenue_forecasting, customer_segmentation, proposal_writing, risk_analysis, sentiment_analysis, territory_planning, document_extraction, compliance_validation.

## Approval Engine

Rules stored in `org_approval_rules` (falls back to platform defaults):

- Proposal above ₹5 lakh → Sales Manager
- Discount above 20% → Director
- Customer deletion → Administrator
- AI confidence below 60% → Manager

Configure via `POST /api/agents/approval-rules`.

## Agent Memory Layers

Tenant-isolated in `agent_memory` collection:

| Layer | TTL | Purpose |
|-------|-----|---------|
| working | 24h | Current task context |
| conversation | 72h | Dialogue history |
| customer | — | Per-customer context |
| organization | — | Org-wide knowledge |
| historical | — | Past decisions |
| preferences | — | Learned preferences |

## Collaboration

Agents delegate via event bus — never direct function calls:

```
Lead Qualification AI → agent.delegate.requested → Proposal AI task
Proposal AI → agent.delegate.requested → Finance AI task
Finance AI → agent.escalated → CEO AI approval
```

## n8n Integration

Set environment variables:

```env
N8N_WEBHOOK_URL=https://your-n8n.example.com/webhook/agent-events
N8N_WEBHOOK_SECRET=your-secret
N8N_ENABLED=true
```

Every subscribed platform event is POSTed to n8n after processors complete. Deliveries logged in `webhook_deliveries`.

Example n8n flow:

```
agent.task.completed → Send Email → Send WhatsApp → Update CRM → Notify Team
```

## Observability

`GET /api/agents/observability` returns:

- Queue depth, throughput, avg processing time
- Failure rate, retry count, SLA compliance
- Approval waiting time, token usage, AI cost
- Confidence distribution, agent health, event rate

Dashboard: `/ops/agents`

## CEO AI Executive Summaries

CEO AI synthesizes outputs from other agents' completed tasks (last 7 days) — it does **not** query CRM modules directly. Briefings stored in `executive_briefings`.

## Security Model

Each agent defines in `lib/agents/security.js`:

- Allowed modules
- Allowed tools
- Allowed actions (read/create/update)
- Maximum approval limit
- Rate limits (tasks per hour)

## APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents` | GET | Registry + runtime + observability |
| `/api/agents/tasks` | GET | Task queue |
| `/api/agents/tasks/:id/approve` | POST | Human approval |
| `/api/agents/worker/run` | POST | Process queued tasks |
| `/api/agents/observability` | GET | Detailed metrics |
| `/api/agents/approval-rules` | GET/POST | Approval configuration |

## Scalability

The runtime supports 100+ future AI employees without architectural redesign:

- Event-driven dispatch (add agent to registry + handler)
- Shared tool/skill framework (no per-agent DB access)
- Tenant-isolated memory and task queues
- Horizontal worker scaling via `/api/agents/worker/run`

## Deployment

1. Run `node scripts/mongo-indexes.mjs` for new collections
2. Set `N8N_WEBHOOK_URL` for external automation
3. Configure org-specific approval rules via API
4. Monitor via `/ops/agents` dashboard

See also: [AGENT_RUNTIME.md](./AGENT_RUNTIME.md), [EVENT_PLATFORM.md](./EVENT_PLATFORM.md)

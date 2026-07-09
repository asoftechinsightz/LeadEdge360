# Event Platform — Technical Documentation

Phase 0 enterprise event platform for LeadEdge360. Platform events are the **single source of truth** for activity feeds, notifications, analytics, AI memory, and future agent runtimes.

## Event Lifecycle

```
Business action (API / Agent / System)
        ↓
emitPlatformEvent()
        ↓
platform_events (versioned, correlated, append-only)
        ↓
Event Processors (idempotent)
  ├── activities → org_activities
  ├── notifications → org_notifications
  ├── analytics → event_analytics
  ├── ai_memory → ai_agent_memory
  └── search_index → event_search_index
        ↓
On failure → dead_letter_events
```

## Event Flow

1. Producer calls `emitPlatformEvent()` with `type`, `payload`, trace context (`correlationId`, `requestId`, `sessionId`).
2. Event is validated against the **Schema Registry** (`lib/events/schema-registry.js`).
3. Event is stored with version (`lead.created.v1`) in `platform_events`.
4. Registered processors run sequentially; failures go to DLQ.
5. In-process listeners (`onPlatformEvent`) run for agent triggers and n8n webhooks.

## Projection Architecture

| Processor | Collection | Idempotency key |
|-----------|------------|-----------------|
| activities | org_activities | `platform_event:{eventId}` |
| notifications | org_notifications | `activity:{activityId}` |
| analytics | event_analytics | orgId + type + day |
| ai_memory | ai_agent_memory | orgId + eventId + agentId |
| search_index | event_search_index | orgId + eventId |

Replay re-runs processors against historical events without duplicating rows.

## Notification Architecture

Notifications are **projections** of activities, not a separate write path. One activity → one notification via `sourceKey`.

## Replay Process

**API:** `POST /api/platform/events/replay`

```json
{
  "from": "2025-01-01T00:00:00.000Z",
  "to": "2026-12-31T23:59:59.999Z",
  "type": "lead.created",
  "targets": ["activities", "notifications", "analytics"],
  "dryRun": false,
  "clearTargets": false
}
```

- **dryRun** — count events only
- **clearTargets** — delete org projections before replay (full rebuild)
- Jobs tracked in `event_replay_jobs`

**UI:** Platform Ops → Event Operations → Replay Platform Events

## Dead Letter Queue

Collection: `dead_letter_events`

| Field | Description |
|-------|-------------|
| event | Full platform event snapshot |
| processor | Failed consumer name |
| error / stack | Failure details |
| retryCount | Retry attempts |
| status | failed \| resolved \| ignored |

**API:**
- `GET /api/platform/events/dlq`
- `POST /api/platform/events/dlq/{id}/retry`
- `POST /api/platform/events/dlq/{id}/ignore`
- `GET /api/platform/events/dlq?export=true`

## Event Registry

**API:** `GET /api/platform/events/registry`

Each entry defines: name, version, producers, consumers, payload schema, description.

Versioned event names: `lead.created.v1`, `proposal.won.v1`, etc.

## Correlation & Traceability

Pass trace context into `emitPlatformEvent()`:

```js
await emitPlatformEvent({
  orgId,
  type: 'proposal.won',
  correlationId: 'corr_abc123',
  requestId: 'req_xyz',
  causationId: priorEvent.id,
  payload: { ... },
})
```

Query full lifecycle: events and audit logs sharing `correlationId`.

## Enterprise Audit

`writeAuditLog()` stores: previousValue, newValue, actor, actorType, IP, browser, device, requestId, correlationId, sessionId, confidence, explanation.

## Retention Policy

Defaults (`lib/events/retention.js`):

| Collection | Retention |
|------------|-----------|
| platform_events | 5 years |
| audit_logs | 7 years |
| org_notifications | 180 days |
| org_activities | unlimited |
| dead_letter_events | 1 year |

Per-org overrides in `org_event_policy`. Archive via `applyRetentionPolicy()`.

## Agent Integration

1. Emit `agent.action` or `agent.task.completed` with `agentId`, `confidence`, `explanation`.
2. Use `writeAgentAuditLog()` for compliance trail.
3. AI memory processor stores context in `ai_agent_memory`.
4. AI Agent Timeline reads from `org_activities` where `actorType = 'agent'`.

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/platform/events` | GET | List events |
| `/api/platform/events/replay` | GET/POST | Replay jobs / trigger replay |
| `/api/platform/events/dlq` | GET | Dead letter queue |
| `/api/platform/events/registry` | GET | Schema registry |
| `/api/platform/events/metrics` | GET | Ops metrics |
| `/api/platform/events/analytics` | GET | Event-derived analytics |
| `/api/platform/ai-ops` | GET | AI operations dashboard |
| `/api/platform/ai-timeline` | GET | AI agent timeline |
| `/api/platform/health` | GET | MongoDB, bus, n8n health |
| `/api/activities` | GET | Unified activity feed |

## Operations UI

| Page | Path |
|------|------|
| Event Operations | `/ops/events` |
| AI Operations | `/ops/ai` |
| AI Agent Timeline | `/ops/ai-timeline` |

## Indexes

Run after deploy:

```bash
node scripts/mongo-indexes.mjs
```

## Phase 1 Readiness

## Phase 1 — Agent Runtime (live)

See [`AGENT_RUNTIME.md`](./AGENT_RUNTIME.md) for the 12-agent registry, task queue, and APIs.

The platform supports dozens of future AI employees without architectural changes:

- Versioned events prevent schema breakage
- DLQ ensures no silent failures
- Replay rebuilds any projection
- Correlation IDs trace full customer lifecycles
- Schema registry documents contracts for humans and agents

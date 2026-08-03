# LeadEdge360 Mobile — Offline Strategy

**Version:** 1.0  
**Constraint:** Client-only — no API or schema changes  

---

## 1. Objectives

1. Field reps can **view** recent leads and follow-ups without connectivity
2. **Capture** new leads and complete follow-ups offline with reliable sync
3. **Never lose** queued mutations
4. **Detect conflicts** when server state changed during offline period

---

## 2. Offline login

| Scenario | Behavior |
|----------|----------|
| Valid refresh token + prior sync | Allow app unlock (biometric/PIN) → show cached data |
| Expired refresh token offline | Show “Connect to sign in” — cannot refresh |
| First install offline | Block — require network for `POST /auth/login-password` or OTP |
| Password login offline | Block |

**Implementation:** On launch, if offline and `refreshToken` exists, skip network refresh attempt until user action requires live data; show stale banner.

---

## 3. Cached data (read model)

| Entity | Source API | Cache TTL | Storage |
|--------|------------|-----------|---------|
| Lead list pages | `GET /leads` | Until sync | SQLite `leads_cache` |
| Lead detail | `GET /leads/{id}` | Per record | SQLite keyed by `id` |
| Follow-ups | `GET /followups` | Until sync | SQLite `followups_cache` |
| Dashboard KPIs | `GET /dashboard/kpis` | 15 min soft TTL | SQLite `dashboard_snapshot` |
| Follow-ups due | `GET /dashboard/followups-due` | 15 min | Same snapshot table |
| User profile | `GET /users/me` | Session | SecureStore + SQLite |
| Notifications | `GET /notifications` | Last fetch | SQLite |
| WhatsApp messages | `GET /whatsapp/conversation/{id}` | Per lead | SQLite |
| Agents list | `GET /agents` | 24h | SQLite |
| Sources | `GET /leads/sources` | 24h | SQLite |

**Sync metadata:** `sync_meta` table stores `entity`, `lastSyncedAt`, `orgId`, `userId`.

**Pagination:** Cache first N pages (default 3 pages × pageSize 50); background fetch more when online.

---

## 4. Lead sync (write path)

### 4.1 Queue structure

```text
sync_queue
  id (uuid)
  entity ('lead' | 'followup' | 'whatsapp' | 'notification_read')
  operation ('create' | 'update' | 'status' | 'assign' | 'delete' | 'close')
  payload (json)
  clientId (uuid for creates)
  serverId (nullable, set after success)
  createdAt
  retryCount
  lastError
  status ('pending' | 'in_flight' | 'failed' | 'done')
```

### 4.2 Create lead offline

1. Insert optimistic row in `leads_cache` with `clientId`, `syncStatus=pending`
2. Queue `POST /leads` with same payload
3. On success: replace `clientId` with server `id` from response
4. On failure: mark failed, show retry UI

Server already assigns score, territory agent on create — client must not duplicate scoring logic.

### 4.3 Update lead offline

Queue appropriate mutation:

- Status change → `POST /leads/{id}/status`
- Assign → `POST /leads/{id}/assign`
- Generic patch → `PATCH /leads/{id}`

Use **last-write-wins** per field with server `updatedAt` check on sync (see conflicts).

---

## 5. Conflict resolution

| Conflict | Resolution |
|----------|------------|
| Lead deleted on server | Remove local row; notify user |
| Server `updatedAt` > local edit base | Show diff dialog: Keep server / Overwrite with mine |
| Status transition invalid | Show server message; refresh detail |
| Duplicate create (retry) | Idempotency: if queue item has `clientId` and server returns same phone match, merge |

No server conflict API — client compares `updatedAt` from cached detail vs `GET /leads/{id}` before applying queued PATCH.

---

## 6. Retry policy

| Error type | Retry |
|------------|-------|
| Network timeout | Exponential backoff: 2s, 4s, 8s, max 5 attempts |
| 502/503 | Same backoff |
| 401 expired | Refresh token once, retry queue item |
| 400 validation | Mark failed — user must fix |
| 403 | Mark failed — permission |

Background sync: on app foreground + connectivity restored, process queue FIFO per entity type (leads before follow-ups).

---

## 7. Attachments

**v1.0 scope:** Lead model has no attachment fields in API. WhatsApp sends text/template only.

| Future | Approach |
|--------|----------|
| Photo of business card | Client JPEG → queue as lead `message` note until attachment API exists |
| Voice note | Out of scope Phase 1 |

Do not invent attachment upload endpoints.

---

## 8. Follow-up sync

Same queue as leads:

- `POST /followups` create
- `PATCH /followups/{id}`
- `POST /followups/{id}/close`
- `DELETE` cancel

Link queued follow-ups to lead `clientId` until server `leadId` resolved.

---

## 9. WhatsApp offline

- **Read:** cache conversation messages
- **Write:** queue `POST /whatsapp/send` — may fail if WhatsApp API down; show queued state
- **Native wa.me:** opens external app (online only)

---

## 10. UI indicators

| State | UI |
|-------|-----|
| Offline | Top banner amber |
| Pending sync | Row icon clock |
| Sync in progress | Header spinner |
| Sync failed | Row warning + tap to retry |
| Stale data | “Last updated {time}” on dashboard |

---

## 11. Storage limits

| Limit | Value |
|-------|-------|
| Max cached leads | 2000 per org |
| Max queue items | 500 |
| Prune | Remove Lost leads older than 90 days from cache |

---

## Related

- [MOBILE_API_MAPPING.md](./MOBILE_API_MAPPING.md)
- [MOBILE_NOTIFICATION_FRAMEWORK.md](./MOBILE_NOTIFICATION_FRAMEWORK.md) — local reminders

# LeadEdge360 Mobile — Notification Framework

**Version:** 1.0  
**Basis:** `lib/mobile-routes.js` notifications + follow-up reminders  
**Constraint:** No new server notification writers  

---

## 1. Overview

Mobile notifications combine:

1. **Push** (FCM/APNs) — device registration via API; delivery depends on server push pipeline maturity
2. **Local** — scheduled from cached follow-ups
3. **In-app** — `GET /notifications` inbox

**Known gap:** `notifications` collection has limited server insert paths (CODEBASE_AUDIT). Phase 1 relies heavily on **local reminders** + device registration.

---

## 2. Push notifications

### 2.1 Registration

| Step | API |
|------|-----|
| On login success | `POST /notifications/devices` |
| On token refresh (FCM rotation) | Same endpoint (upsert) |
| Body | `{ platform: 'ios' \| 'android', token, deviceName? }` |

Storage: `push_devices` collection keyed by `userId` + `token`.

### 2.2 Payload convention (client contract)

Until server standardizes payloads, client should handle:

```json
{
  "type": "followup_due | lead_assigned | generic",
  "entityId": "uuid",
  "title": "string",
  "body": "string",
  "deepLink": "leadedge360://lead/{id}"
}
```

### 2.3 Permission UX

- Request permission after first successful login (not on splash)
- If denied: explain value in Settings with re-request CTA

---

## 3. Local notifications

### 3.1 Follow-up reminders

| Source | Trigger |
|--------|---------|
| `GET /followups/reminders?withinHours=24` | Poll when app opens + every 4h background fetch |
| Cached follow-ups | Schedule local notification at `dueAt` |

**Channels:** `call`, `meeting`, `visit`, `whatsapp`, `email` (from follow-up `channel` field).

### 3.2 Scheduling rules

- Schedule up to 50 upcoming local notifications per device
- Cancel/reschedule when follow-up closed or `dueAt` patched
- Overdue: immediate local notification on sync if `dueAt < now` and status `open`

---

## 4. In-app notifications

| API | Use |
|-----|-----|
| `GET /notifications` | Inbox list; `unreadOnly=true` for badge |
| `POST /notifications/{id}/read` | Mark read on tap |
| `GET /notifications/settings` | User prefs |
| `PATCH /notifications/settings` | Toggle push/email/whatsapp flags |

User preferences also on `users.preferences.notifications` via `PATCH /users/me`.

---

## 5. Notification types (product mapping)

| Business event | Phase 1 delivery | Deep link |
|----------------|------------------|-----------|
| **Reminders** | Local + optional push | `leadedge360://followup/{id}` |
| **Meetings** | Local (follow-up channel=meeting) | Same |
| **Assignments** | Push when server sends; else poll lead detail | `leadedge360://lead/{id}` |
| **Proposal accepted** | Map to lead status → Won (no dedicated push) | Lead detail |
| **Invoice paid** | **No API** — ROADMAP | — |
| **Renewals** | Subscription read only; optional local 7-day warning from cached `subscription.currentEnd` | Subscription screen |

**Do not invent** proposal/invoice webhook handlers on mobile.

---

## 6. Notification preferences UI

| Toggle | Maps to |
|--------|---------|
| Push notifications | `preferences.notifications.push` |
| Email | `preferences.notifications.email` |
| WhatsApp | `preferences.notifications.whatsapp` |

Sync via `PATCH /notifications/settings` or `PATCH /users/me`.

---

## 7. Badge counts

| Surface | Source |
|---------|--------|
| App icon badge | `GET /notifications` → `unread` |
| Tasks tab | Count open follow-ups due today (local + API) |
| In-app dot | Same unread count |

---

## 8. Quiet hours (client Phase 2)

- Local setting only — suppress non-critical local notifications 22:00–08:00 user timezone
- Does not affect server push if sent

---

## 9. Testing notifications

| Test | Method |
|------|--------|
| Device registration | POST devices → verify 201 |
| Local schedule | Create follow-up due in 2 min |
| Mark read | POST read → unread decrements |
| Permission denied | Graceful degradation |

---

## Related

- [MOBILE_API_MAPPING.md](./MOBILE_API_MAPPING.md)
- [MOBILE_OFFLINE_STRATEGY.md](./MOBILE_OFFLINE_STRATEGY.md)

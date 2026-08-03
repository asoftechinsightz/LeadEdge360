# LeadEdge360 Mobile — Test Strategy

**Version:** 1.0  
**Scope:** Mobile client QA against existing API — no server test changes required  

---

## 1. Test pyramid

```
        ┌─────────┐
        │  UAT    │  Field pilot with real agents
        ├─────────┤
        │ Integr. │  API + offline sync + push
        ├─────────┤
        │ Widget  │  Screen components
        ├─────────┤
        │  Unit   │  Services, parsers, queue
        └─────────┘
```

---

## 2. Unit tests

| Area | Cases |
|------|-------|
| Auth service | Token refresh logic, 401 retry once |
| API error mapper | All `AUTH_*`, `LEAD_NOT_FOUND` codes |
| Sync queue | FIFO ordering, retry backoff, idempotent create |
| Date formatters | Follow-up due display, IST locale |
| RBAC helpers | `canAssign(role)`, `canAdmin(role)` |
| Lead filters | Query string builder for `GET /leads` |
| Offline conflict | `updatedAt` comparison |

**Tool:** Jest  
**Target coverage:** ≥ 80% on `services/` and `sync/` modules

---

## 3. Widget / component tests

| Component | Cases |
|-----------|-------|
| LeadRow | Score badge, status chip, Hot label |
| KpiCard | Loading skeleton, value render |
| FollowUpRow | Overdue styling |
| EmptyState | CTA navigation |
| OfflineBanner | Visible when NetInfo offline |
| SignInForm | Validation errors |

**Tool:** React Native Testing Library

---

## 4. Integration tests

| Flow | Steps |
|------|-------|
| Password login | login-password → me → leads list |
| OTP login | login-otp → verify-otp → tokens |
| Refresh | Expire access → refresh-token → retry GET |
| Create lead | POST leads → appears in list |
| Status pipeline | New → Contacted → Won |
| Follow-up lifecycle | create → close |
| WhatsApp send | send → conversation shows message |
| Device register | POST notifications/devices |
| Admin users | admin GET users (403 for agent) |

**Tool:** Detox or Maestro E2E against staging API  
**Data:** Dedicated test org; never production customer data

---

## 5. UAT (user acceptance)

| Persona | Scenarios |
|---------|-----------|
| Field agent | Capture lead at site, call/WhatsApp, close follow-up |
| Manager | View team KPIs, reassign lead |
| Admin | Invite user, view subscription |

**Duration:** 2 weeks pilot with 5–10 users  
**Sign-off:** Product Owner + Sales lead

---

## 6. Performance tests

| Metric | Target |
|--------|--------|
| Cold start | < 3s to interactive (cached session) |
| Lead list scroll | 60 fps with 200 rows |
| API parallel fetch | Dashboard 2 calls < 2s p95 on 4G |
| SQLite query | < 50ms for 1000 cached leads |
| Memory | < 150MB typical session |

**Tool:** Flashlight / React Native perf monitor

---

## 7. Battery tests

| Scenario | Acceptable |
|----------|------------|
| 8h field day (GPS off) | < 15% battery from app |
| Background sync every 15 min | < 5% additional |
| Local notification scheduling | No wake loops |

Disable aggressive polling; use push + pull on foreground.

---

## 8. Offline tests

| Case | Expected |
|------|----------|
| Create 10 leads offline | All queue |
| Reconnect | All sync, IDs mapped |
| Edit same lead offline + server edit | Conflict UI |
| Login offline no refresh | Block with message |
| WhatsApp queue offline | Pending until online |

---

## 9. Security tests

| Test | Method |
|------|--------|
| Tokens not in logs | Log audit |
| SecureStore for refresh | File system inspection |
| Certificate pinning | MITM proxy should fail pinned build |
| Logout clears cache | No PII after logout |
| Jailbreak detection | Optional warning |
| Session after suspend | 403 → sign out |

**OWASP MASVS** Level 1 checklist for storage and network.

---

## 10. Accessibility tests

| Check | Tool |
|-------|------|
| VoiceOver / TalkBack | Manual on lead list + detail |
| Dynamic type | iOS largest size |
| Contrast | Automated snapshot |
| Touch target size | 44pt audit |

---

## 11. Regression suite

Run on every release candidate:

1. Auth login/logout/refresh
2. Lead CRUD + list filters
3. Follow-up CRUD
4. Offline queue sync
5. Push device registration
6. Deep link to lead

**CI:** GitHub Actions job `mobile-test` (see Developer Guide).

---

## 12. Test environments

| Env | URL | Use |
|-----|-----|-----|
| Staging | `staging.asoftechinsightz.com/api` | CI + QA |
| Production | `app.asoftechinsightz.com/api` | Smoke only post-release |

Use Postman collection [`../postman-collection.json`](../postman-collection.json) for API contract regression parallel to mobile E2E.

---

## Related

- [MOBILE_SECURITY.md](./MOBILE_SECURITY.md)
- [MOBILE_OFFLINE_STRATEGY.md](./MOBILE_OFFLINE_STRATEGY.md)

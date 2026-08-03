# LeadEdge360 Mobile — UX Guidelines

**Version:** 1.0  
**Aligns with:** AsoftechInsightz web design tokens (`app/globals.css`)  
**Status:** Blueprint only  

---

## 1. Design principles

1. **Field-first** — large tap targets, thumb-zone actions, minimal typing
2. **Data density without clutter** — KPI cards + scannable lists (ServiceNow/Dynatrace density, not marketing hero)
3. **Same brand as web** — LeadEdge360 orange + growth green on dark canvas
4. **Honest states** — loading, empty, error, offline always explicit
5. **No invented workflows** — mirror web lead statuses and labels

---

## 2. Platform guidelines

### 2.1 Material Design 3 (Android)

- Use M3 components where RN Paper or equivalent provides them
- **Navigation:** bottom bar + modal sheets for filters
- **FAB:** primary action “New lead” on Leads tab
- **Elevation:** subtle cards; avoid heavy shadows (dark theme)
- **Motion:** standard M3 easing for sheet open/close

### 2.2 iOS Human Interface Guidelines

- **Tab bar:** 5 tabs max (matches IA)
- **Large titles** on list screens (collapsible on scroll)
- **Swipe actions** on lead rows: call, WhatsApp, status
- **Safe areas** respected on notched devices
- **Haptics** on successful sync and follow-up close

### 2.3 Cross-platform parity

Same feature set and tab order on iOS and Android; platform-specific navigation animations only.

---

## 3. Design system (from web tokens)

| Token | Value | Usage |
|-------|-------|-------|
| Background | `hsl(222, 47%, 5%)` ≈ `#0B1220` | App background |
| Card | `hsl(222, 41%, 8%)` | Cards, sheets |
| Primary | `#FF8A3D` (orange) | CTAs, active tab, Hot label |
| Accent | `#22C55E` (green) | Success, Won, positive KPI |
| Muted text | `hsl(220, 10%, 65%)` | Secondary labels |
| Border | `hsl(222, 25%, 16%)` | Dividers |
| Radius | `0.85rem` base | Cards, buttons |
| Display font | Space Grotesk (or system fallback) | Headlines |
| Body font | Inter / system sans | Body |

### Score / label colors (match web CRM)

| Label | Color |
|-------|-------|
| Hot | Primary orange |
| Warm | Amber `#F59E0B` |
| Cold | Slate |

| Status | Color hint |
|--------|------------|
| New | Sky |
| Contacted | Indigo |
| Qualified | Amber |
| Proposal | Fuchsia |
| Won | Green |
| Lost | Rose |

---

## 4. Dark mode

- **Default:** dark only for Phase 1 (matches web `dark` class)
- **Future:** light mode optional Phase 5; tokens should be structured for theme swap
- Avoid pure `#000` — use background token

---

## 5. Accessibility

| Requirement | Spec |
|-------------|------|
| Touch targets | Minimum 44×44 pt |
| Contrast | WCAG AA for text on cards |
| Screen readers | Label all icon buttons; announce score and status |
| Dynamic type | Support iOS larger text; test list truncation |
| Reduce motion | Respect system setting |
| Color | Do not rely on color alone for Hot/Warm/Cold — include text label |

---

## 6. Responsive layout

| Breakpoint | Layout |
|------------|--------|
| Phone portrait | Single column, bottom tabs |
| Phone landscape | 2-column lead detail optional (master-detail) |
| Tablet (≥768dp) | Split view: list + detail; optional side nav instead of bottom tabs |
| Foldables | Follow tablet rules when unfolded width ≥ tablet |

---

## 7. Tablet support

- **Leads:** master-detail split (list left, detail right)
- **Dashboard:** 2×2 KPI grid
- **Do not** add desktop-only features without API backing

---

## 8. Landscape support

- Lock auth screens to portrait optional
- Lead capture form scrollable in landscape
- Charts rotate with full width on Growth Hub

---

## 9. Loading states

| Pattern | Use |
|---------|-----|
| Skeleton placeholders | Lead list, dashboard KPIs |
| Pull-to-refresh | All list screens |
| Inline button spinner | Submit lead, send WhatsApp, close follow-up |
| Full-screen loader | Initial auth token exchange only |
| Stale banner | “Updated 5 min ago” when showing cache |

---

## 10. Empty states

| Screen | Message | CTA |
|--------|---------|-----|
| Leads | “No leads yet” | Add lead |
| Tasks | “No follow-ups scheduled” | Create from lead |
| Notifications | “No notifications” | — |
| Conversations | “No messages yet” | Send WhatsApp |
| Dashboard (new org) | “Start by adding your first lead” | Add lead |

Illustration: minimal line icon, not marketing 3D art.

---

## 11. Error states

| Type | UX |
|------|-----|
| Network | Banner + retry; preserve form input |
| 401 | Silent refresh once; then sign in |
| 403 `PERMISSION_DENIED` | Explain role limitation |
| 404 | “Record not found” + back |
| 502/503 | Retry with backoff message |
| Validation | Field-level from `VALIDATION_FAILED.details` |

Always show API `message`; log `code` + `traceId`.

---

## 12. Offline states

| Element | Behavior |
|---------|----------|
| Global banner | Amber strip: offline mode |
| Queued writes | Badge on affected rows “Pending sync” |
| Blocked actions | Login, password reset, admin user create |
| Sync complete | Toast “All changes synced” |

See [MOBILE_OFFLINE_STRATEGY.md](./MOBILE_OFFLINE_STRATEGY.md).

---

## 13. Motion & feedback

- Tab switch: 200ms fade
- Modal sheets: platform default
- Success: green check toast
- Destructive: confirm dialog (delete lead, cancel follow-up)

---

## 14. Copy & terminology

Use LeadEdge360 web terms:

- **Lead** not “contact” in CRM surfaces (except “Contact” as verb)
- **Follow-up** in UI; “Task” tab label acceptable alias
- **Territory** not “region” unless API field says `territory`
- Status values exactly: New, Contacted, Qualified, Proposal, Won, Lost

---

## Related

- [MOBILE_SCREEN_BLUEPRINTS.md](./MOBILE_SCREEN_BLUEPRINTS.md)
- [MOBILE_ARCHITECTURE.md](./MOBILE_ARCHITECTURE.md)

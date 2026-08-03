# Phase 1 Deployment Verification

**Product:** AsoftechInsightz  
**Verification date:** 21 June 2026  
**Live URL:** https://app.asoftechinsightz.com  
**Local workspace audited:** `C:\Users\ARNAV\Downloads\asoftech-insightz-v1.2.0\asoftech-insightz`  
**Method:** Static file audit (local) + live HTTP probes + page content fingerprinting (production)  
**Scope:** Implementation status and deploy parity only — no new designs or mockups.

---

## Executive finding

| Question | Answer |
|----------|--------|
| Is Phase 1 implemented locally? | **Yes** — route groups, `AppShell`, `/dashboard`, `/billing`, marketing/app separation are present in the local workspace. |
| Is Phase 1 visible on production? | **No** — `app.asoftechinsightz.com` does not serve this codebase revision. |
| Root cause | **Deploy gap + codebase divergence.** Phase 1 work exists only in the local Downloads copy. It was not committed/pushed from this machine, and production appears to run a different `main` branch (GIX marketing redesign) that never received the `(application)` route group or AppShell wiring. |

**Bottom line:** The live symptom (marketing navbar on product pages, no sidebar) is expected for the code currently deployed. Phase 1 is **implemented but not deployed**.

---

## 1. Routes that use `SiteShell` (local workspace)

`SiteShell` = `Navbar` + page content + `Footer` + DPDP banner (`components/site/SiteShell.jsx`).

### Via layout (automatic)

| URL | Layout file | Shell |
|-----|-------------|-------|
| `/` | `app/(marketing)/layout.js` | `SiteShell` |
| `/about` | `app/(marketing)/layout.js` | `SiteShell` |
| `/products` | `app/(marketing)/layout.js` | `SiteShell` |
| `/solutions` | `app/(marketing)/layout.js` | `SiteShell` |
| `/pricing` | `app/(marketing)/layout.js` | `SiteShell` |
| `/contact` | `app/(marketing)/layout.js` | `SiteShell` |
| `/blog` | `app/(marketing)/layout.js` | `SiteShell` |

Marketing page components under `app/(marketing)/*` do **not** import `SiteShell` directly; the route-group layout provides it once.

### Via inline wrapper (standalone routes)

| URL | File | Shell |
|-----|------|-------|
| `/signin` | `app/signin/page.js` | `SiteShell` (inline) |
| `/privacy` | `app/privacy/page.js` | `SiteShell` (inline) |
| `/terms` | `app/terms/page.js` | `SiteShell` (inline) |
| `/download` | `app/download/page.js` | `SiteShell` (inline) |

### Does NOT use `SiteShell`

| Path | Notes |
|------|-------|
| `app/(application)/*` | Uses `AppShell` only (see §2) |
| `app/app/*` | Legacy redirects only; layout is passthrough |
| `app/api/*` | API routes |

---

## 2. Routes that use `AppShell` (local workspace)

`AppShell` = sidebar (`WORKSPACE_NAV`), `ProductSwitcher`, `DashboardHeader`, flat app background (`components/layout/AppShell.jsx`).

### Via layout (automatic)

All routes under `app/(application)/` are wrapped by `app/(application)/layout.js`:

| URL | Page file | Shell |
|-----|-----------|-------|
| `/dashboard` | `app/(application)/dashboard/page.js` | `AppShell` |
| `/leadedge360` | `app/(application)/leadedge360/page.js` | `AppShell` |
| `/retailedge360` | `app/(application)/retailedge360/page.js` | `AppShell` |
| `/billing` | `app/(application)/billing/page.js` | `AppShell` |
| `/billing/success` | `app/(application)/billing/success/page.js` | `AppShell` |

**Verification:** `grep SiteShell app/(application)` returns **no matches**. Product pages no longer wrap themselves in marketing chrome.

### App sidebar nav (production contract)

From `components/layout/app-nav.js` → `WORKSPACE_NAV`:

- Dashboard → `/dashboard`
- LeadEdge360 → `/leadedge360`
- RetailEdge360 → `/retailedge360`
- Billing → `/billing`

---

## 3. Is `AppShell` wired into production routes?

### Local workspace: **Yes**

```
app/(application)/layout.js
  └── import AppShell from '@/components/layout/AppShell'
  └── return <AppShell>{children}</AppShell>
```

Next.js App Router maps route groups `(marketing)` and `(application)` to the **same URL paths** without a URL prefix. `/leadedge360` resolves to `(application)/leadedge360` locally, which inherits `AppShell`.

Supporting config also present locally:

- `next.config.js` — `/app/*` → `/dashboard` / product redirects
- Auth callback — `GET /api/auth/callback` redirects to `/dashboard` (not `/leadedge360`)
- Marketing navbar — no LeadEdge/Retail links; authenticated users get **Workspace** → `/dashboard`

### Production (`app.asoftechinsightz.com`): **No evidence AppShell is deployed**

| Signal | Local (Phase 1) | Live production |
|--------|-----------------|-----------------|
| `/dashboard` | Route exists | **HTTP 404** |
| `/billing` | Route exists | **HTTP 404** |
| `/billing/success` | Route exists | **HTTP 404** |
| `/leadedge360` | `AppShell`, H1 **"Lead command center"** | **HTTP 200**, H1 **"Growth Command Center"**, marketing-style experience reported |
| `/solutions` | **"AI automation for how India actually sells"** | **HTTP 200**, **"GIX Solutions"** / Growth Intelligence copy |
| `/about` | **"We're building India's AI-first business suite"** | **HTTP 200**, **"Growth Intelligence Experience (GIX)"** |
| `/signin` | DPDP consent + Google-only flow | OTP / Email login UI, LeadEdge360-branded sign-in |

Production exposes marketing URLs (`/`, `/about`, `/products`, `/pricing`, `/contact`, `/blog`, `/solutions`, `/signin` → all **200**) and legacy product URLs (`/leadedge360`, `/retailedge360` → **200**), but **none of the Phase 1 application-only routes**.

**Conclusion:** `AppShell` is wired correctly in the local codebase but is **not** part of the build currently running on the VPS.

---

## 4. Were changes committed but not deployed?

### Local git state

| Check | Result |
|-------|--------|
| `.git` directory in Downloads workspace | **Not present** — folder is not a git clone on this machine |
| `git` in PATH (Windows) | **Not available** — could not inspect commit history locally |
| Sprint 19A / Phase 1 changelog | Documents **suggested commit messages**; notes commits were **not executed** in the agent environment |

### Deploy pipeline (from repo)

File: `.github/workflows/deploy.yml`

- **Trigger:** `push` to branch `main` (or manual `workflow_dispatch`)
- **Target:** VPS `/opt/asoftech` via `git reset --hard origin/main`
- **Runtime:** `docker compose up -d --build`
- **Smoke test:** `GET $PUBLIC_URL/api/` must return `"ok":true`

### Assessment

| Scenario | Likelihood | Evidence |
|----------|------------|----------|
| Committed to `main`, deploy failed | Possible but unverified | No GitHub Actions access from this audit |
| Committed to `main`, not deployed | Unlikely if workflow is healthy | Production **is** serving new GIX marketing pages — deploys are happening |
| **Never committed / never pushed** | **Most likely** | No `.git` locally; Phase 1 exists only in Downloads copy; production content fingerprints do not match local files |
| Committed to non-`main` branch | Possible | Workflow only deploys `main` |

**Conclusion:** Phase 1 changes were **not verified as committed or pushed to `origin/main`**. Even if partially committed elsewhere, they are **not** what production is running.

---

## 5. Is `app.asoftechinsightz.com` serving old code?

**It is serving a different codebase revision — not the Phase 1 local workspace.**

Production is **not** “one commit behind.” It is a **divergent tree**:

1. **GIX marketing layer** on production (Growth Audit, GIX Solutions, OTP sign-in) — strings **absent** from local v1.2.0 workspace (`grep` for `GIX`, `Growth Audit`, `OTP Login` → no matches).
2. **Phase 1 application layer** exists locally (`(application)` route group, `/dashboard`, `/billing`, `AppShell`) — routes **missing or 404** on production.
3. **Shared surface names, different implementations** — `/leadedge360` and `/solutions` return 200 on both, but page copy and chrome differ materially.

| Page | Local fingerprint | Production fingerprint | Match? |
|------|-------------------|------------------------|--------|
| `/` | "Transforming Businesses Through AI & Automation" | "Accelerate Revenue Growth With AI-Powered Growth Intelligence" | ❌ |
| `/about` | "AI-first business suite" | "Growth Intelligence Experience (GIX)" | ❌ |
| `/solutions` | "AI automation for how India actually sells" | "GIX Solutions" | ❌ |
| `/signin` | DPDP + Continue with Google | OTP Login / Email Login | ❌ |
| `/leadedge360` | "Lead command center" + `AppShell` | "Growth Command Center" + marketing chrome (user report) | ❌ |
| `/dashboard` | Exists | 404 | ❌ |
| `/billing` | Exists | 404 | ❌ |

---

## 6. Production route probe summary (21 Jun 2026)

HTTP `HEAD` requests to `https://app.asoftechinsightz.com`:

| Route | Status | Expected after Phase 1 deploy |
|-------|--------|-------------------------------|
| `/` | 200 | 200 (SiteShell) |
| `/about` | 200 | 200 (SiteShell) |
| `/products` | 200 | 200 (SiteShell) |
| `/pricing` | 200 | 200 (SiteShell) |
| `/contact` | 200 | 200 (SiteShell) |
| `/blog` | 200 | 200 (SiteShell) |
| `/solutions` | 200 | 200 (SiteShell) — **content must match local Phase 1 page** |
| `/signin` | 200 | 200 (SiteShell) |
| `/dashboard` | **404** | **200 (AppShell)** |
| `/leadedge360` | 200 | 200 (**AppShell**, not SiteShell) |
| `/retailedge360` | 200 | 200 (**AppShell**) |
| `/billing` | **404** | **200 (AppShell)** |
| `/billing/success` | **404** | **200 (AppShell)** |
| `/api/` | 308 redirect | 200 JSON `ok: true` |

---

## 7. Why the live app matches your report

On production today:

1. **Product routes still use marketing chrome** — consistent with pre–Phase 1 architecture (`SiteShell` on `/leadedge360`) or a GIX fork that never adopted `app/(application)/layout.js`.
2. **No enterprise sidebar** — `AppShell` / `WORKSPACE_NAV` not in deployed bundle (or not mounted on these routes).
3. **Marketing hero on `/`** — production homepage is the GIX growth-marketing variant, not the local Phase 1 marketing home.
4. **`/dashboard` 404** — definitive signal Phase 1 application routes were not deployed.

---

## 8. Local implementation checklist (verified)

| Phase 1 item | Status in local workspace |
|--------------|---------------------------|
| `app/(marketing)/layout.js` → `SiteShell` | ✅ Present |
| `app/(application)/layout.js` → `AppShell` | ✅ Present |
| `/dashboard` page | ✅ Present |
| `/billing` + `/billing/success` under `(application)` | ✅ Present |
| `leadedge360` / `retailedge360` under `(application)` | ✅ Present |
| Marketing pages stripped of inline `SiteShell` | ✅ Verified |
| Marketing navbar without product app links | ✅ Verified |
| Auth callback → `/dashboard` | ✅ `app/api/[[...path]]/route.js` |
| `/solutions` marketing page | ✅ Present |
| `next.config.js` `/app/*` redirects | ✅ Present |

**Local Phase 1 implementation status: complete.**  
**Production deployment status: not deployed / wrong revision.**

---

## 9. Remediation (deploy only — no new design work)

1. **Establish git source of truth** — clone the GitHub repo that backs `/opt/asoftech` (per `.github/DEPLOY_SETUP.md`) to a machine with `git` access.
2. **Port Phase 1 diff** — merge the local Downloads workspace into that repo (or cherry-pick Phase 1 commits if they exist on another branch).
3. **Resolve divergence with GIX marketing** — production `main` contains GIX copy (`/`, `/about`, `/solutions`, `/signin`). Merging requires a **content decision**: keep GIX marketing pages under `(marketing)` while still applying `(application)` + `AppShell` — do not drop Phase 1 route groups during merge.
4. **Commit and push to `main`** — triggers `.github/workflows/deploy.yml`.
5. **Verify GitHub Actions** — build must pass `yarn build`; smoke test must pass.
6. **Post-deploy smoke tests** (production):

   ```bash
   curl -fsS https://app.asoftechinsightz.com/api/ | grep '"ok":true'
   curl -o /dev/null -w "%{http_code}" https://app.asoftechinsightz.com/dashboard   # expect 200
   curl -o /dev/null -w "%{http_code}" https://app.asoftechinsightz.com/billing    # expect 200
   ```

7. **Visual QA** — signed-in user on `/leadedge360` must show **sidebar + DashboardHeader**, not marketing `Navbar`/`Footer`.

---

## 10. Files to diff first when reconciling with production

Priority files that explain the live vs local gap:

| File / path | Why |
|-------------|-----|
| `app/(application)/layout.js` | Mounts `AppShell` — likely **missing** on production `main` |
| `app/(application)/dashboard/page.js` | Explains `/dashboard` 404 |
| `app/(application)/billing/page.js` | Explains `/billing` 404 |
| `app/(marketing)/layout.js` | Marketing shell separation |
| `components/layout/AppShell.jsx` | Enterprise chrome |
| `components/site/Navbar.jsx` | Marketing vs workspace separation |
| `app/(marketing)/page.js` vs production home | GIX vs v1.2.0 marketing copy |
| `app/signin/page.js` | OTP vs Google consent flow |

---

## Appendix A — Deploy architecture reference

```
Developer push → GitHub (branch: main)
       ↓
.github/workflows/deploy.yml (yarn build + SSH)
       ↓
VPS /opt/asoftech  (git reset --hard origin/main)
       ↓
docker compose up -d --build
       ↓
https://app.asoftechinsightz.com
```

Until Phase 1 reaches `origin/main` and the workflow completes successfully, **production will continue to show marketing chrome on product routes**.

---

*Generated from static analysis and live probes. Re-run §6 probes after deploy to close this verification.*

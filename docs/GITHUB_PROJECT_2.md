# GitHub Project #2 — LeadEdge360 P0/P1 sync

**Board:** [arnav02champ / Project 2](https://github.com/users/arnav02champ/projects/2)

Use this doc to add cards/issues to the project. Work is implemented locally; repo has **no commits or remote** yet — push + PRs are the next step.

---

## Recommended columns

| Column | Cards |
|--------|--------|
| **Done** | PR-1 … PR-5 (after merge) |
| **In review** | Open PRs |
| **In progress** | Loom demo |
| **Backlog** | Post-P0: mobile parity, SAML hardening |

---

## Cards to add (copy as issues → link to project)

### 1. P0 — Onboarding + demo data
**Labels:** `P0`, `activation`, `onboarding`  
**Branch:** `feat/p0-onboarding-demo-seed`

- Auto-seed 10 leads + 1 opp + 1 proposal on signup
- `lib/onboarding/demo-seed.js`, Clear Demo Data in Settings
- Leads zero banner + Get Started checklist (sidebar)
- **Test:** `node --test tests/p0-leadedge360.test.js`

---

### 2. P0 — Marketing Automation v1 + Visual Workflow
**Labels:** `P0`, `automation`, `marketing`  
**Branch:** `feat/p0-marketing-automation`

- 3 drips: Nurture (D0 email → D1 WA → D3 call), Proposal (D2/D5), Winback (D30)
- `VisualWorkflow.tsx`, `CampaignBuilder.tsx`, `create_task` in workflow engine
- Automation Hub primary over legacy Campaigns list

---

### 3. P1 — Integrations + Security & SSO
**Labels:** `P1`, `enterprise`, `integrations`  
**Branch:** `feat/p1-integrations-sso`

- `/administration/integrations` — Gmail, Outlook, Meta, Google, Razorpay, WhatsApp
- Settings → **Security & SSO** tab (Google + SAML + SLA)
- **Acceptance:** Gmail OAuth from integrations page; admin sees SSO tab

---

### 4. P1 — Attribution + Analytics tab
**Labels:** `P1`, `analytics`, `revenue`  
**Branch:** `feat/p1-attribution-analytics`

- Analytics → **Attribution & ROAS** tab
- Source → Lead → Revenue, Meta/Google ROAS (existing APIs)

---

### 5. P0 — Nav unify + sidebar audit
**Labels:** `P0`, `nav`, `ux`  
**Branch:** `feat/p0-nav-unify`

- Unified sidebar (reference modules: Dashboard → Administration)
- Canonical `/leadedge360/leads`; legacy `/leads` redirects with query
- Get Started checklist until 3 onboarding tasks done

---

### 6. Demo — Loom: onboarding → paid
**Labels:** `demo`, `release`  
**Script:** `docs/P0_PR_PLAN.md` (Loom section)

~3 min: signup → checklist → automation → WhatsApp CTA → integrations → SSO → attribution → Razorpay

---

## Unblock automation (for agent / CI)

```powershell
# 1. Install GitHub CLI (if missing)
winget install GitHub.cli

# 2. Auth
gh auth login

# 3. Add remote (replace with your repo)
git remote add origin https://github.com/arnav02champ/asoftech-insightz.git

# 4. Initial commit + push (after review)
git add -A
git commit -m "feat: LeadEdge360 P0/P1 activation + enterprise gaps"
git push -u origin main

# 5. Create issues and add to project 2
gh issue create --title "P0: Onboarding + demo data" --body-file .github/ISSUE_P0_ONBOARDING.md
gh project item-add 2 --owner arnav02champ --url <issue-url>
```

---

## Acceptance checklist (project “Done” definition)

- [ ] New user sees data in **&lt;3 min** (auto-seed + CTAs)
- [ ] **3-step automation** activated in **&lt;2 min**
- [ ] **Gmail** connect from integrations page
- [ ] **Security & SSO** tab visible to org admin
- [ ] `tests/p0-leadedge360.test.js` — 13/13 pass
- [ ] Loom attached to release / PR description

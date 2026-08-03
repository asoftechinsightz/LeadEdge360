# LeadEdge360 — Training Academy

**Version:** 1.0  
**Audience:** Admin, Sales, Managers, CS, AI Growth coaches  

**Certification:** Complete exercises + checklist at end of each track.

---

## Learning paths overview

| Track | Duration | Audience | Outcome |
|-------|----------|----------|---------|
| **Admin** | 2 h | Tenant admin, IT | Provision users, health checks |
| **Sales** | 3 h | Agents, reps | Pipeline + WhatsApp mastery |
| **Manager** | 2 h | Sales heads | KPIs, territories, coaching |
| **Customer Success** | 4 h | CS team | Onboarding + escalation |
| **AI Growth** | 2 h | Owners, marketing | AEO + content workflows |

---

## Track 1 — Admin Training

### Modules

1. Sign-in, DPDP consent, password rotation (`POST /api/users/change-password`)  
2. Dashboard navigation (`/dashboard`, `/leadedge360`, `/retailedge360`)  
3. Environment health (`/api/health`) — Mongo, SMTP, Razorpay flags  
4. n8n ingest overview (WhatsApp, Google, FB) — ops coordination  
5. Billing & plans (`/pricing`, `/api/billing/plans`) when configured  

### Exercise 1

- Sign in as admin; rotate password  
- Verify `/api/health` returns `ok: true`  
- Create one test lead via API or UI; delete or mark Lost  

### Exercise 2

- Walk through `docs/POST_DEPLOY_CHECKLIST.md` §3–5 with ops  

---

## Track 2 — Sales Training

### Modules

1. First login + bookmarks  
2. Create lead: fields, territories, sources  
3. AI score, label, reasons — when to re-score  
4. Status workflow: New → Won  
5. WhatsApp deep link etiquette + opt-in  
6. Filters: territory, status, role  

### Exercise 1

- Create 3 leads (google, whatsapp, referral)  
- Move one to Qualified → Proposal → Won  
- Contact one Hot lead via WhatsApp template ([AI_CONTENT_LIBRARY.md](./AI_CONTENT_LIBRARY.md))  

### Exercise 2

- Explain your top lead's score reasons to a peer  

---

## Track 3 — Manager Training

### Modules

1. Executive KPI guide — conversion, hot, trend  
2. Agent performance table — coaching low conversion  
3. SOURCES and TERRITORY charts — budget decisions  
4. Role filter (admin vs agent view)  
5. Weekly review cadence ([CUSTOMER_SUCCESS_PLAYBOOK.md](./CUSTOMER_SUCCESS_PLAYBOOK.md))  

### Exercise 1

- Identify weakest territory from chart; assign action plan  
- Review agent with lowest conversion; document coaching note  

### Exercise 2

- Present 5-minute pipeline review using dashboard only  

---

## Track 4 — Customer Success Training

### Modules

1. Onboarding kit end-to-end  
2. Authenticated validation checklist  
3. Adoption metrics + escalation matrix  
4. Commercial validation templates  
5. Runtime / deploy parity awareness (`docs/operations/runtime-handover/`)  

### Exercise 1

- Run mock kickoff using [CUSTOMER_ONBOARDING_KIT.md](./CUSTOMER_ONBOARDING_KIT.md)  
- Complete authenticated validation on staging/pilot tenant  

### Exercise 2

- Fill sample ROI template for fictional MSME  
- Draft escalation email for missing AEO section  

---

## Track 5 — AI Growth Training

### Modules

1. AEO Score formula and 5 KPIs ([EXECUTIVE_KPI_GUIDE.md](./EXECUTIVE_KPI_GUIDE.md))  
2. Profile setup + checklist (`config/aeo/readiness-checklist.json`)  
3. FAQ, GBP, review workflows  
4. In-product AI drafts vs manual publish  
5. 30-day growth plan (`docs/aeo/post-deployment/06_CUSTOMER_SUCCESS_ENABLEMENT.md`)  

### Exercise 1

- Reach 80% Business Completeness on test tenant  
- Add 5 FAQs; record Local Visibility before/after adding territory leads  

### Exercise 2

- Generate GBP post + review reply; document manual publish steps  
- Record Monday AEO Score for 4 consecutive weeks (table)  

---

## Certification checklist

| Requirement | Admin | Sales | Manager | CS | AI Growth |
|-------------|-------|-------|---------|-----|-----------|
| Completed all module readings | ☐ | ☐ | ☐ | ☐ | ☐ |
| Completed exercises | ☐ | ☐ | ☐ | ☐ | ☐ |
| Peer demo observed | ☐ | ☐ | ☐ | ☐ | ☐ |
| CS/Ops sign-off | ☐ | ☐ | ☐ | ☐ | ☐ |

**Certified by:** _______________ **Date:** _______________

**Badge:** Internal "LeadEdge360 Certified" — CS maintains roster.

---

## Related

- [CUSTOMER_ONBOARDING_KIT.md](./CUSTOMER_ONBOARDING_KIT.md)  
- `docs/aeo/AEO_USER_JOURNEY.md`

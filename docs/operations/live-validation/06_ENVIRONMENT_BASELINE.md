# WS6 — Environment Baseline

**Pilot:** `https://app.asoftechinsightz.com`  
**Validation date:** 2 August 2026  
**Rule:** Report **presence only** — **no secret values**

---

## 1. SSH `.env` inspection

| Result |
|--------|
| **NOT PERFORMED** — SSH `Permission denied (publickey,password)` to `asoftech@185.38.109.200` |

Use ops checklist:

```bash
cd /opt/asoftech
for v in MONGO_URL JWT_SECRET CERT_ADMIN_EMAIL CERT_ADMIN_PASSWORD EMERGENT_LLM_KEY REQUIRE_AUTH PILOT_MODE; do
  grep -q "^${v}=" .env && echo "$v: Present" || echo "$v: Missing"
done
```

---

## 2. Inference from public health endpoint (non-secret)

**Source:** `GET /api/health` (2 Aug 2026)

| Variable / concept | Inferred presence | Evidence |
|--------------------|-------------------|----------|
| **MONGO_URL** | **Present** (effective) | `checks.database.ok: true`, detail `connected` |
| **PILOT_MODE** | **Present** (effective) | `pilot.pilotMode: true`, `status: "pilot"` |
| **REQUIRE_AUTH** | **Present** (effective) | `/api/leads` → 401 without cookie |
| **JWT_SECRET** | **Unknown** | Cannot verify without SSH; mobile JWT would fail if missing |
| **EMERGENT_LLM_KEY** | **Unknown** | Not exposed in health; test via new lead `engine` field after login |
| **CERT_ADMIN_EMAIL** | **Unknown** | Not referenced in health JSON |
| **CERT_ADMIN_PASSWORD** | **Unknown** | Not referenced in health JSON |

### Related keys observed in health (not in PO list)

| Key area | Status |
|----------|--------|
| Razorpay (`NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) | **Missing** (health reports not configured) |
| SMTP (`SMTP_HOST`, etc.) | **Missing** |

---

## 3. PO checklist summary

| Variable | Reported status |
|----------|-----------------|
| MONGO_URL | **Present** (inferred — DB connected) |
| JWT_SECRET | **Unknown** (SSH required) |
| CERT_ADMIN_EMAIL | **Unknown** (SSH required) |
| CERT_ADMIN_PASSWORD | **Unknown** (SSH required) |
| EMERGENT_LLM_KEY | **Unknown** (SSH required) |
| REQUIRE_AUTH | **Present** (inferred — 401 on protected APIs) |
| PILOT_MODE | **Present** (inferred — health JSON) |

---

## 4. Local RC reference (`.env.example`)

The approved AEO Phase-1 **local** template documents:

- `MONGO_URL`, `EMERGENT_LLM_KEY`, Emergent Auth keys, Razorpay keys, `N8N_WEBHOOK_TOKEN`

Does **not** list `CERT_ADMIN_*`, `PILOT_MODE`, or `REQUIRE_AUTH` — live pilot binary includes pilot health surface **not in local RC**.

---

## 5. WS6 verdict

**INCOMPLETE** — Effective presence confirmed for Mongo + pilot mode + auth enforcement; full PO env matrix requires **SSH key-only audit** by ops.

**No secret values recorded in this report.**

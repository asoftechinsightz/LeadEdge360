# Dependency Security Report

**Scan date:** 3 August 2026  
**Command:** `npm audit`  
**Lockfiles:** `package.json`, `yarn.lock` present  

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 3 |
| Moderate | 3 |
| **Total** | **8** |

---

## Direct dependencies (production highlights)

| Package | Version | Notes |
|---------|---------|-------|
| next | 14.2.3 | Check advisories via audit chain |
| axios | 1.10.0 | **Multiple CVEs** — upgrade ≥1.15.1 |
| jsonwebtoken | 9.0.3 | Review algorithm/agility |
| mongodb | (see lockfile) | Keep current patch level |
| bcryptjs | ^3.0.3 | OK for password hashing |
| razorpay | (see lockfile) | Payment SDK |

---

## Notable advisories (axios)

| Advisory | Severity | Issue |
|----------|----------|-------|
| GHSA-4hjh-wcwx-xvwj | High | DoS via lack of size check |
| GHSA-pmwg-cvhr-8vh7 | High | SSRF / NO_PROXY bypass |
| GHSA-3p68-rc4w-qgx5 | Moderate | SSRF hostname normalization |
| GHSA-w9j2-pvgh-6h63 | Moderate | validateStatus prototype pollution |

---

## Deprecated / maintenance

| Item | Status |
|------|--------|
| `mongodb-memory-server` | Dev-only install (if present) — not production runtime |
| Node engine | CI uses 20 — align VPS runtime |

---

## Recommendations

1. Run `npm audit fix` and manual upgrade for breaking changes.
2. Pin `axios` to patched version in `package.json`.
3. Add CI step: `npm audit --audit-level=high` (fail on high/critical).
4. Enable Dependabot or equivalent on GitHub.
5. Re-scan after lockfile update before VPS deploy.

**Note:** This audit did not modify dependencies per charter.

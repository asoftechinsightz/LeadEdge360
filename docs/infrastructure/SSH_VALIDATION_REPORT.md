# SSH Validation Report

**Date:** 3 August 2026  
**Scope:** Read-only SSH connectivity tests — no deploy, no restart  

---

## Summary

| Result | Detail |
|--------|--------|
| **Overall SSH validation** | **PARTIAL PASS** |
| **Working path** | `ssh asoftech-vps` → `root@187.127.179.138:22` |
| **Primary failure mode** | Wrong user / wrong IP / wrong key combination |
| **Authentication bypass** | **Not attempted** |

---

## SSH configuration (workstation)

| Item | Value |
|------|-------|
| Config file | `C:\Users\ARNAV\.ssh\config` |
| Host alias | `asoftech-vps` |
| HostName | `187.127.179.138` |
| User | `root` |
| Port | `22` |
| IdentityFile | `C:\Users\ARNAV\.ssh\asoftech_vps` |
| Key present | **Yes** |
| `asoftech_ci` key | **Missing** on workstation |
| Default `id_ed25519` / `id_rsa` | **Missing** |

---

## Connection attempts

| # | Command / target | Result | Classification |
|---|------------------|--------|----------------|
| 1 | `ssh -i asoftech_vps asoftech@185.38.109.200` | Permission denied (publickey,password) | **Wrong key / wrong user** |
| 2 | `ssh -i asoftech_vps root@185.38.109.200` | Permission denied (publickey,password) | **Wrong key** (root may not accept this key on DNS IP) |
| 3 | `ssh -i asoftech_vps asoftech@187.127.179.138` | Permission denied (publickey,password) | **Wrong user** |
| 4 | `ssh -i asoftech_vps asoftech@app.asoftechinsightz.com` | Permission denied (publickey,password) | **Wrong user** |
| 5 | `ssh asoftech-vps` (config: root@187.127.179.138) | **SUCCESS** — `OK`, hostname `leadedge360`, `/opt/asoftech` exists | **Approved path** |
| 6 | `ssh -i asoftech_vps root@187.127.179.138` | **SUCCESS** | Same as #5 |

### Not observed in successful probes

- Connection timeout (earlier sessions reported timeout to `187.127.179.138` — **not reproduced** in this audit)
- Firewall drop on port 22 from operator network (**22 is reachable**)

---

## Post-login verification (read-only)

| Check | Result |
|-------|--------|
| `hostname` | `leadedge360` |
| `test -d /opt/asoftech-insightz` | **Yes** |
| `test -d /opt/asoftech` | **Yes** (backups only) |
| Remote command without shell | **Works** |

---

## GitHub Actions SSH identity

Per `.github/DEPLOY_SETUP.md`, CI should use dedicated key **`asoftech_ci`** installed on VPS for user **`asoftech`**.

| Item | Status |
|------|--------|
| `asoftech_ci` on workstation | **Not present** |
| CI key on VPS for `asoftech` | **Not verified** (no `asoftech` login test with CI key) |
| `root` key `asoftech_vps` | **Works** for break-glass ops |

**Implication:** GitHub Actions deploy may fail even if secrets exist, if `VPS_SSH_KEY` is `asoftech_ci` but that key is not authorized for the target user/host.

---

## Firewall / network notes

| Observation | Detail |
|-------------|--------|
| Public DNS | `app.asoftechinsightz.com` → `185.38.109.200`–`209` |
| SSH management IP | `187.127.179.138` |
| HTTPS | Works to public hostname |
| SSH to DNS pool IP as `asoftech` | Permission denied — may be different host or key policy |

---

## Exact reasons for failed attempts

| Failure | Root cause |
|---------|------------|
| `Permission denied (publickey,password)` on `asoftech@*` | User `asoftech` does not accept `asoftech_vps` key (or password auth disabled) |
| `Permission denied` on `root@185.38.109.200` | Key not authorized on that IP / different machine in DNS pool |
| Earlier `Connection timed out` to `187.127.179.138` | Transient network or firewall — **not current state** |

---

## Recommendations

1. **Authorize CI key:** `ssh-copy-id -i asoftech_ci.pub asoftech@187.127.179.138` (or correct deploy user).
2. **Document working ops path:** `ssh asoftech-vps` for root break-glass.
3. **Set `VPS_HOST`** to `187.127.179.138` (SSH-reachable) unless bastion workflow is defined.
4. **Set `VPS_USER`** to user that accepts `VPS_SSH_KEY` (`asoftech` per setup guide).
5. **Do not disable** pubkey auth or weaken firewall as a “fix”.

---

## Verdict

| SSH ready for CI deploy | **CONDITIONAL** — ops SSH works; CI identity not validated |
| SSH ready for manual ops | **YES** — via `asoftech-vps` |

**No authentication bypass attempted.** No deployment performed.

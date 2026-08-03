# Nginx Security Report

**Reference file:** `docs/nginx.conf` (not auto-deployed — manual ops install)

---

## TLS

| Check | Status |
|-------|--------|
| TLS 1.2+ | Pass — `ssl_protocols TLSv1.2 TLSv1.3` |
| Certbot paths | Documented |
| HTTP → HTTPS redirect | Pass on apex/app vhost |

---

## Security headers (nginx layer)

| Header | nginx.conf | next.config.js | Conflict |
|--------|------------|----------------|----------|
| HSTS | `max-age=31536000` | Not set | nginx adds — **Good** |
| X-Content-Type-Options | `nosniff` | Not set | nginx adds |
| X-Frame-Options | `SAMEORIGIN` | `ALLOWALL` | **Conflict** — Next may override downstream |
| Referrer-Policy | `strict-origin-when-cross-origin` | Not set | nginx adds |
| CSP | Not full CSP | `frame-ancestors *` | Weak at app layer |

**Finding:** App-level headers may weaken nginx posture for responses served directly from Next on port 3000 if nginx does not strip/replace headers.

---

## Rate limiting

| Item | Status |
|------|--------|
| `limit_req_zone` for auth | Documented in server block |
| **Config validity** | `limit_req_zone` should be in `http` context — current snippet may need ops correction |
| Webhook limits | Not documented |

---

## Other

| Check | Status |
|-------|--------|
| `client_max_body_size` | 25M — reasonable |
| Directory listing | Not enabled |
| flows.asoftechinsightz.com | Basic auth + proxy to n8n — **Good** |
| Compression | Not explicitly configured |

---

## Recommendations

1. Ensure nginx is **actually** fronting production (not exposing 3000 publicly).
2. Align Next `headers()` with nginx (fix H-02 at app or strip at proxy).
3. Add rate limits for `/api/webhooks/` and general `/api/`.
4. Validate nginx config with `nginx -t` after moving `limit_req_zone` to `http` block.
5. Enable OCSP stapling if supported by certbot profile.

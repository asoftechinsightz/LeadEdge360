# AsoftechInsightz API — Error code matrix

All errors follow this envelope (HTTP status code + body):

```json
{ "code": "AUTH_INVALID_CREDENTIALS", "message": "Email or password is incorrect.", "traceId": "req_8f3…", "details": {} }
```

## Authentication (4xx)

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `AUTH_VALIDATION` | Required field missing or invalid format |
| 401 | `AUTH_INVALID_CREDENTIALS` | Email/password or OTP wrong |
| 401 | `AUTH_TOKEN_EXPIRED` | Access token expired — call `/auth/refresh-token` |
| 401 | `AUTH_TOKEN_INVALID` | Tampered / unknown access token |
| 401 | `AUTH_REFRESH_INVALID` | Refresh token revoked or unknown |
| 403 | `AUTH_EMAIL_NOT_VERIFIED` | Verify email before continuing |
| 403 | `AUTH_PHONE_NOT_VERIFIED` | Verify phone via OTP |
| 403 | `AUTH_ACCOUNT_SUSPENDED` | Account suspended by admin |
| 409 | `AUTH_EMAIL_IN_USE` | Email already registered |
| 409 | `AUTH_PHONE_IN_USE` | Phone already registered |
| 429 | `AUTH_OTP_RATE_LIMIT` | Too many OTP requests — try again later |
| 429 | `AUTH_OTP_ATTEMPTS_EXCEEDED` | Wrong OTP attempted 5 times; request a new one |

## Authorization (4xx)

| HTTP | Code | Meaning |
|---|---|---|
| 403 | `PERMISSION_DENIED` | Caller lacks the required permission |
| 403 | `TENANT_MISMATCH` | Resource belongs to another tenant |
| 403 | `SUBSCRIPTION_REQUIRED` | Feature requires an active paid plan |
| 402 | `PLAN_LIMIT_EXCEEDED` | Hit your plan limit (e.g. leads/month) |

## Resources (4xx)

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_FAILED` | Body or query failed schema validation (`details` has field paths) |
| 404 | `LEAD_NOT_FOUND` | Lead id not in tenant |
| 404 | `FOLLOWUP_NOT_FOUND` | Follow-up not in tenant |
| 404 | `USER_NOT_FOUND` | |
| 409 | `CONFLICT_DUPLICATE` | Duplicate code/slug/sku |
| 409 | `STATE_INVALID` | Invalid state transition (e.g. closing an already-closed follow-up) |

## Integrations (4xx / 5xx)

| HTTP | Code | Meaning |
|---|---|---|
| 502 | `WHATSAPP_API_ERROR` | Meta WhatsApp API returned an error |
| 502 | `SMS_API_ERROR` | MSG91/Twilio SMS provider returned an error |
| 502 | `RAZORPAY_API_ERROR` | Razorpay rejected the order/payment |
| 502 | `LLM_API_ERROR` | AI scoring/predict failed (response falls back to rules engine) |
| 401 | `WEBHOOK_SIGNATURE_INVALID` | HMAC signature mismatch on inbound webhook |

## Server (5xx)

| HTTP | Code | Meaning |
|---|---|---|
| 500 | `INTERNAL_ERROR` | Unexpected error — `traceId` will be in logs |
| 503 | `SERVICE_UNAVAILABLE` | Upstream (DB / LLM / Razorpay) temporarily unavailable |
| 503 | `MAINTENANCE` | Planned maintenance — retry after `Retry-After` header |

## Client guidance

- Always show the `message` field to the user; log `code` + `traceId`.
- On 401 `AUTH_TOKEN_EXPIRED`, transparently call `/auth/refresh-token` and retry the original request once.
- On 429, respect `Retry-After` (seconds) header.
- On 502/503, exponential back-off (1s, 2s, 4s) with max 3 retries.

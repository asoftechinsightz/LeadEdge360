# Authentication Flow

## Mobile sign-up + login (recommended)

```mermaid
sequenceDiagram
  participant App as Mobile App
  participant API as AsoftechInsightz API
  participant SMS as SMS Provider (MSG91)
  participant DB  as PostgreSQL

  App->>API: POST /auth/register
  API->>DB:  INSERT users (status='invited', verified=false)
  API->>SMS: send 6-digit OTP
  API-->>App: 201 { userId, otpSent:true }

  App->>API: POST /auth/verify-otp { destination, code, purpose:'signup' }
  API->>DB:  validate + mark phone_verified
  API-->>App: 200 { accessToken, refreshToken, user }

  Note over App,API: subsequent calls
  App->>API: GET /leads (Authorization: Bearer <accessToken>)
  API-->>App: 200 { leads:[], meta:{} }

  Note over App,API: when access expires (15 min)
  App->>API: POST /auth/refresh-token { refreshToken }
  API->>DB:  validate refresh, rotate
  API-->>App: 200 { new accessToken, new refreshToken }
```

## Email + password login

```mermaid
sequenceDiagram
  App->>API: POST /auth/login-password { email, password }
  API->>DB:  bcrypt compare
  alt 200 OK
    API-->>App: { accessToken, refreshToken, user }
  else 401
    API-->>App: { code:"AUTH_INVALID_CREDENTIALS" }
  end
```

## Forgot / reset

```mermaid
sequenceDiagram
  App->>API: POST /auth/forgot-password { destination }
  API->>SMS/Email: send OTP
  App->>API: POST /auth/reset-password { destination, code, newPassword }
  API-->>App: 200
```

## Token model

| Token         | TTL     | Storage on client                | Notes                                                              |
|---------------|---------|----------------------------------|--------------------------------------------------------------------|
| accessToken   | 15 min  | Memory only                      | Signed JWT, contains `userId`, `tenantId`, `role`, `permissions`   |
| refreshToken  | 30 days | Secure Storage / Keychain        | Opaque, rotated on every refresh, stored hashed in DB              |
| OTP           | 5 min   | Server-side only                 | bcrypt-hashed, max 5 attempts                                      |

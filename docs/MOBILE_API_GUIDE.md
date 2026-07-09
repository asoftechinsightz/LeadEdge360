# Mobile App Integration — Quick-start

This is what a mobile developer needs to consume the AsoftechInsightz API.

## 1. Base URLs

| Env | URL |
|---|---|
| Production | `https://app.asoftechinsightz.com/api` |
| Staging    | `https://staging.asoftechinsightz.com/api` |
| Demo       | `https://qualify-leads-hub.preview.emergentagent.com/api` |

## 2. Spec

- Machine-readable: [`docs/openapi.json`](./openapi.json) — paste into [editor.swagger.io](https://editor.swagger.io) for interactive docs.
- Postman collection: [`docs/postman-collection.json`](./postman-collection.json) — includes test scripts that auto-populate `accessToken` / `refreshToken` / `leadId`.
- Auth flow diagrams: [`docs/auth-flow.md`](./auth-flow.md)
- Error codes: [`docs/error-codes.md`](./error-codes.md)

## 3. SDK starter snippets

### Kotlin (Android, Retrofit)
```kotlin
interface AsoftechApi {
  @POST("auth/login-password")
  suspend fun login(@Body body: LoginRequest): AuthTokens

  @GET("leads")
  suspend fun listLeads(
    @Query("page") page: Int = 1,
    @Query("pageSize") pageSize: Int = 20,
    @Query("q") q: String? = null,
    @Query("status") status: String? = null
  ): LeadsPage

  @POST("leads")
  suspend fun createLead(@Body lead: LeadInput): Lead
}

// OkHttp interceptor to attach Bearer + refresh on 401
class AuthInterceptor(private val store: TokenStore, private val api: AuthApi) : Interceptor {
  override fun intercept(chain: Chain): Response {
    val req = chain.request().newBuilder()
      .addHeader("Authorization", "Bearer ${store.access}").build()
    val res = chain.proceed(req)
    if (res.code != 401) return res
    val newTokens = runBlocking { api.refresh(RefreshRequest(store.refresh)) }
    store.access = newTokens.accessToken
    store.refresh = newTokens.refreshToken
    res.close()
    return chain.proceed(req.newBuilder().header("Authorization", "Bearer ${newTokens.accessToken}").build())
  }
}
```

### Swift (iOS, URLSession + async/await)
```swift
struct AuthTokens: Codable { let accessToken: String; let refreshToken: String; let user: User }

final class AsoftechClient {
  let base = URL(string: "https://app.asoftechinsightz.com/api")!
  var access: String?; var refresh: String?

  func login(email: String, password: String) async throws -> AuthTokens {
    var req = URLRequest(url: base.appendingPathComponent("auth/login-password"))
    req.httpMethod = "POST"
    req.setValue("application/json", forHTTPHeaderField: "Content-Type")
    req.httpBody = try JSONEncoder().encode(["email": email, "password": password])
    let (data, _) = try await URLSession.shared.data(for: req)
    let tokens = try JSONDecoder().decode(AuthTokens.self, from: data)
    self.access = tokens.accessToken; self.refresh = tokens.refreshToken
    return tokens
  }

  func listLeads() async throws -> [Lead] {
    var req = URLRequest(url: base.appendingPathComponent("leads"))
    req.setValue("Bearer \(access ?? "")", forHTTPHeaderField: "Authorization")
    let (data, _) = try await URLSession.shared.data(for: req)
    return try JSONDecoder().decode(LeadsPage.self, from: data).leads
  }
}
```

### React Native (axios)
```ts
import axios from 'axios'
const api = axios.create({ baseURL: 'https://app.asoftechinsightz.com/api' })
api.interceptors.request.use(c => { c.headers.Authorization = `Bearer ${store.access}`; return c })
api.interceptors.response.use(r => r, async (err) => {
  if (err.response?.status === 401 && store.refresh) {
    const r = await axios.post('/auth/refresh-token', { refreshToken: store.refresh })
    store.access = r.data.accessToken; store.refresh = r.data.refreshToken
    err.config.headers.Authorization = `Bearer ${store.access}`
    return axios(err.config)
  }
  throw err
})
```

## 4. Push notifications

On login or app start, post the FCM (Android) / APNs (iOS) token to `/notifications/devices` so the server can deliver follow-up reminders / new-lead alerts.

## 5. WhatsApp deep-link helper

```
https://wa.me/<digits-only-phone>?text=<URL-encoded message>
```
Use the `phone` field from a Lead. Always url-encode the message body.

## 6. DPDP-compliant signup screen requirements

During registration, your mobile UI MUST collect explicit consent for:
- **Essential** processing (always required)
- **Analytics** (optional toggle)
- **Marketing** (optional toggle)

And link to your Privacy Policy + Terms. Send the resulting consent object inside `POST /auth/register → dpdpConsent`.

## 7. Implementation status (against this spec)

| Endpoint                            | Implemented in demo? | Notes |
|------------------------------------|----------------------|-------|
| `/leads/*`, `/dashboard/kpis`, `/agents`, `/contact`, `/billing/*`, `/webhooks/*`, `/auth/me`, `/auth/login`, `/auth/logout`, `/auth/dpdp-consent`, `/products/*`, `/retail-kpis` | ✅ yes (MongoDB-backed demo) |
| `/auth/register`, `/auth/verify-otp`, `/auth/login-password`, `/auth/login-otp`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/refresh-token` | 🟡 spec-complete — reference implementation included for Postgres deployment |
| `/followups/*`, `/notifications/*`, `/whatsapp/*`, `/admin/*` | 🟡 spec-complete — wire to Postgres tables in your production cut-over |

The demo deliberately runs on MongoDB to keep the live preview fast. The canonical schema (`docs/sql/*.sql`) covers every endpoint above and is what you deploy in production.

// =============================================================================
// =============================================================================
//  Mobile API route handlers (MongoDB-backed, JWT-authenticated)
//  Implements the OpenAPI surface declared in docs/openapi.json.
//  Returns either a NextResponse, or null if no route matched (so the main
//  router can continue trying other handlers).
// =============================================================================
// =============================================================================
import { NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { getDb } from './mongo'
import { hashPassword, verifyPassword } from './password'
import { signAccessToken, issueRefreshToken, rotateRefreshToken, revokeRefreshToken, verifyAccessToken, TOKEN_TTLS, listUserSessions, revokeSessionById, revokeAllForUserExcept, hashRefreshToken, touchRefreshToken } from './jwt'
import { issueOtp, verifyOtp as verifyOtpCode } from './otp'
import { assertLoginAllowed, recordLoginFailure, recordLoginSuccess, deviceFingerprint } from './auth/rate-limit'
import { verifyGoogleIdToken, isGoogleAuthConfigured } from './google-auth'
import { signEmailVerificationToken, verifyEmailVerificationToken, buildEmailVerificationUrl } from './email-verification'
import { aiScore } from './scoring'
import { toE164India, phonesMatch } from './phone'
import { isPublicSignupEnabled, publicSignupPolicy } from './auth/signup-policy'
import { buildConsentAudit, logConsentEvent } from './consent-audit'
import { attachLeadOnboardingCookies, syncLeadOnboardingCookies } from './onboarding/onboarding-flow'

const json = (data, init = {}) => NextResponse.json(data, init)
const err  = (code, message, status = 400, details) =>
  NextResponse.json({ code, message, ...(details ? { details } : {}) }, { status })

// ─── helpers ───
async function requireAuth(request) {
  const auth = request.headers.get('authorization') || ''
  if (!auth.startsWith('Bearer ')) return { error: err('AUTH_TOKEN_INVALID', 'Missing Bearer token', 401) }
  const payload = verifyAccessToken(auth.slice(7))
  if (!payload) return { error: err('AUTH_TOKEN_EXPIRED', 'Token invalid or expired', 401) }
  const { getDevUserFromPayload, isDevAuthBypassEnabled } = await import('./dev-auth')
  if (isDevAuthBypassEnabled()) {
    const devUser = getDevUserFromPayload(payload)
    if (devUser) return { user: devUser, payload }
  }
  const db = await getDb()
  const user = await db.collection('users').findOne({ id: payload.sub }, { projection: { _id: 0, passwordHash: 0 } })
  if (!user) return { error: err('AUTH_TOKEN_INVALID', 'User no longer exists', 401) }
  return { user, payload }
}

function pickUser(u) {
  if (!u) return null
  const { passwordHash, _id, ...rest } = u
  return rest
}

async function buildTokens(db, user, ctx = {}) {
  const fp = deviceFingerprint(ctx)
  const access  = signAccessToken({ userId: user.id, tenantId: user.orgId, role: user.role || 'admin', perms: [] })
  const refresh = await issueRefreshToken({ userId: user.id, ...ctx, device: ctx.deviceId || ctx.device || fp })
  return {
    accessToken: access,
    refreshToken: refresh,
    expiresIn: TOKEN_TTLS.access,
    tokenType: 'Bearer',
    user: pickUser(user),
  }
}

async function authJsonResponse(db, user, ctx = {}) {
  const payload = await buildTokens(db, user, ctx)
  const cookieState = await syncLeadOnboardingCookies(db, user.orgId)
  const res = json(payload)
  attachLeadOnboardingCookies(res, {
    required: cookieState.trialFlag === '1',
    currentStep: Number(cookieState.cookieStep) || 0,
    complete: cookieState.complete,
  })
  return res
}

// =============================================================================
// =============================================================================
//  AUTH
// =============================================================================
// =============================================================================
async function handleAuth(method, id, action, request, db) {
  // GET /auth/signup-policy
  if (id === 'signup-policy' && method === 'GET') {
    return json(publicSignupPolicy())
  }

  // POST /auth/register
  if (id === 'register' && method === 'POST') {
    if (!isPublicSignupEnabled()) {
      return err(
        'SIGNUP_DISABLED',
        'Public signup is disabled. Use pilot provisioning or contact your account manager.',
        403,
      )
    }
    const body = await request.json()
    if (!body.email || !body.phone || !body.password || !body.fullName)
      return err('VALIDATION_FAILED', 'email, phone, password, fullName are required')
    if (body.password.length < 8) return err('VALIDATION_FAILED', 'Password must be \u22658 characters')

    const consentInput = body.dpdpConsent || {}
    if (!consentInput.termsAccepted || !consentInput.privacyRead || !consentInput.dataProcessingAccepted) {
      return err('CONSENT_REQUIRED', 'Terms, Privacy Policy, and data processing consent are required')
    }

    const normalizedPhone = toE164India(body.phone)
    if (!normalizedPhone) return err('VALIDATION_FAILED', 'Enter a valid 10-digit Indian mobile number')

    const exists = await db.collection('users').findOne({
      $or: [{ email: body.email.trim().toLowerCase() }, { phone: normalizedPhone }],
    })
    if (exists) return err(exists.email === body.email.trim().toLowerCase() ? 'AUTH_EMAIL_IN_USE' : 'AUTH_PHONE_IN_USE',
                            'Email or phone already registered', 409)

    const orgId = uuid()
    const now = new Date().toISOString()
    await db.collection('orgs').insertOne({
      id: orgId,
      name: body.tenantName || `${body.fullName}'s Workspace`,
      ownerEmail: body.email.trim().toLowerCase(),
      plan: 'starter',
      leadQuickSetupRequired: true,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
    })
    await db.collection('onboarding_progress').insertOne({
      orgId,
      leadQuickSetupRequired: true,
      leadQuickSetup: {
        companyName: false,
        demoLeadsImported: false,
        aiScoreViewed: false,
        completed: false,
      },
      completedPercent: 0,
      createdAt: now,
      updatedAt: now,
    })
    const dpdpConsent = buildConsentAudit({
      termsAccepted: consentInput.termsAccepted,
      privacyRead: consentInput.privacyRead,
      dataProcessingAccepted: consentInput.dataProcessingAccepted,
      marketingConsent: consentInput.marketingConsent === true,
      registrationMethod: consentInput.registrationMethod || 'email',
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
      userAgent: request.headers.get('user-agent') || '',
    })

    const user = {
      id: uuid(), orgId,
      email: body.email.trim().toLowerCase(), phone: normalizedPhone, fullName: body.fullName,
      passwordHash: await hashPassword(body.password),
      role: 'admin',
      status: 'invited',
      businessSuiteEnabled: true,
      products: ['leadedge360'],
      activeProduct: 'leadedge360',
      emailVerified: false,
      phoneVerified: false,
      dpdpConsent,
      preferences: {
        notifications: {
          push: true,
          email: true,
          whatsapp: true,
          marketing: dpdpConsent.marketingConsent,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await db.collection('users').insertOne(user)
    await logConsentEvent(db, {
      userId: user.id,
      orgId,
      email: user.email,
      consent: dpdpConsent,
      event: 'registration_consent',
    })

    // Auto-seed demo pipeline so new trials see data in <3 min (non-blocking).
    try {
      const { seedOrgDemoData } = await import('./onboarding/demo-seed.js')
      const industry = body.industry || 'general'
      const seed = await seedOrgDemoData(db, orgId, {
        industry,
        companyName: body.tenantName || body.fullName,
      })
      if (!seed.skipped) {
        await db.collection('onboarding_progress').updateOne(
          { orgId },
          {
            $set: {
              'leadQuickSetup.demoLeadsImported': true,
              'leadQuickSetup.demoSeedAt': new Date().toISOString(),
              completedPercent: 33,
              updatedAt: new Date().toISOString(),
            },
          },
        )
      }
    } catch (seedErr) {
      console.warn('[auth] demo seed on signup skipped:', seedErr.message)
    }

    const smsConfigured = !!process.env.MSG91_AUTH_KEY
    const channel = body.channel || (smsConfigured ? 'sms' : 'email')
    const otpDestination = channel === 'email' ? user.email : normalizedPhone
    let o = { ok: true, channel, destination: otpDestination }
    try {
      o = await issueOtp({
        destination: otpDestination,
        purpose: 'signup',
        channel,
        ip: request.headers.get('x-forwarded-for') || '',
      })
    } catch (e) {
      if (e.message === 'AUTH_OTP_RATE_LIMIT') {
        return err('AUTH_OTP_RATE_LIMIT', e.detail || 'Too many OTP requests', 429)
      }
      console.warn('[auth] OTP issue failed:', e.message)
    }

    // Send email verification link
    try {
      const token = signEmailVerificationToken({ userId: user.id, email: user.email })
      const verifyUrl = buildEmailVerificationUrl(token)
      const { sendEmail } = await import('./email/send-email')
      await sendEmail({
        fromName: 'Asoftech Business Suite',
        to: user.email,
        subject: 'Verify your email',
        html: `<p>Hi ${user.fullName},</p><p><a href="${verifyUrl}">Click here to verify your email</a>.</p><p>This link expires in 24 hours.</p>`,
      })
    } catch (e) {
      console.warn('[auth] email verification send skipped:', e.message)
    }

    return json({
      userId: user.id,
      otpSent: true,
      channel: o.channel || channel,
      otpDestination: o.destination || otpDestination,
      emailVerificationSent: true,
      ...(o.devOtp ? { devOtp: o.devOtp } : {}),
    }, { status: 201 })
  }

  // POST /auth/verify-otp
  if (id === 'verify-otp' && method === 'POST') {
    const body = await request.json()
    const { destination, code, purpose } = body
    if (!destination || !code || !purpose) return err('VALIDATION_FAILED', 'destination, code, purpose required')
    if (purpose === 'signup' && !isPublicSignupEnabled()) {
      return err('SIGNUP_DISABLED', 'Public signup is disabled.', 403)
    }
    const v = await verifyOtpCode({ destination, code, purpose })
    if (!v.ok) {
      const map = { INVALID: 'AUTH_INVALID_CREDENTIALS', EXPIRED: 'AUTH_OTP_RATE_LIMIT', TOO_MANY_ATTEMPTS: 'AUTH_OTP_ATTEMPTS_EXCEEDED', NO_OTP: 'AUTH_INVALID_CREDENTIALS' }
      return err(map[v.error] || 'AUTH_INVALID_CREDENTIALS', `OTP ${v.error.toLowerCase().replace(/_/g, ' ')}`, 401)
    }
    // mark user verified
    const user = await db.collection('users').findOne({
      $or: [
        { phone: destination },
        { email: destination },
        { phone: toE164India(destination) },
      ],
    })
    if (!user) return err('USER_NOT_FOUND', 'No user for that destination', 404)
    const update = { updatedAt: new Date().toISOString() }
    if (purpose === 'signup' || purpose === 'verify') {
      if (phonesMatch(user.phone, destination)) update.phoneVerified = true
      if (user.email === String(destination).trim().toLowerCase()) update.emailVerified = true
      update.status = 'active'
    }
    await db.collection('users').updateOne({ id: user.id }, { $set: update, $unset: { lastLoginAt: '' } })
    const fresh = await db.collection('users').findOne({ id: user.id })
    await db.collection('users').updateOne({ id: user.id }, { $set: { lastLoginAt: new Date().toISOString() } })

    if (purpose === 'login' || purpose === 'signup') {
      return authJsonResponse(db, fresh, { ip: request.headers.get('x-forwarded-for') || '', ua: request.headers.get('user-agent') || '' })
    }
    return json({ ok: true })
  }

  // POST /auth/verify-email
  if (id === 'verify-email' && method === 'POST') {
    const { token } = await request.json()
    if (!token) return err('VALIDATION_FAILED', 'token required')
    const payload = verifyEmailVerificationToken(token)
    if (!payload) return err('VALIDATION_FAILED', 'Invalid or expired verification link', 400)
    const user = await db.collection('users').findOne({ id: payload.userId })
    if (!user) return err('USER_NOT_FOUND', 'User not found', 404)
    if (user.email !== payload.email) return err('VALIDATION_FAILED', 'Token email mismatch', 400)
    await db.collection('users').updateOne(
      { id: user.id },
      { $set: { emailVerified: true, status: user.status === 'invited' ? 'active' : user.status, updatedAt: new Date().toISOString() } },
    )
    return json({ ok: true })
  }

  // POST /auth/send-email-verification
  if (id === 'send-email-verification' && method === 'POST') {
    const a = await requireAuth(request)
    let email, userId
    if (a.error) {
      const body = await request.json().catch(() => ({}))
      email = body.email
      if (!email) return err('VALIDATION_FAILED', 'email required or authenticate', 401)
      const u = await db.collection('users').findOne({ email })
      if (!u) return json({ ok: true })
      userId = u.id
      email = u.email
    } else {
      userId = a.user.id
      email = a.user.email
    }
    const token = signEmailVerificationToken({ userId, email })
    const verifyUrl = buildEmailVerificationUrl(token)
    try {
      const { sendEmail } = await import('./email/send-email')
      await sendEmail({
        fromName: 'Asoftech Business Suite',
        to: email,
        subject: 'Verify your email',
        html: `<p><a href="${verifyUrl}">Click here to verify your email</a>.</p>`,
      })
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        return json({ ok: true, devVerifyUrl: verifyUrl })
      }
      return err('EMAIL_SEND_FAILED', 'Could not send verification email', 503)
    }
    return json({ ok: true })
  }

  // POST /auth/login-otp  (send OTP to phone via SMS or WhatsApp)
  if (id === 'login-otp' && method === 'POST') {
    const body = await request.json()
    const phone = body.phone || body.destination
    const channel = body.channel === 'whatsapp' ? 'whatsapp' : 'sms'
    if (!phone) return err('VALIDATION_FAILED', 'phone required')
    const user = await db.collection('users').findOne({ phone })
    if (!user) return err('USER_NOT_FOUND', 'Phone not registered', 404)
    const o = await issueOtp({ destination: phone, purpose: 'login', channel, ip: request.headers.get('x-forwarded-for') || '' })
    return json({ ok: true, channel, ...(o.devOtp ? { devOtp: o.devOtp } : {}) })
  }

  // POST /auth/login-password
  if (id === 'login-password' && method === 'POST') {
    const body = await request.json()
    if (!body.email || !body.password) return err('VALIDATION_FAILED', 'email and password required')
    const ip = request.headers.get('x-forwarded-for') || ''
    try {
      await assertLoginAllowed(db, { ip, email: body.email })
    } catch (e) {
      return err(e.message, e.detail || 'Too many attempts', 429)
    }
    const user = await db.collection('users').findOne({ email: body.email })
    if (!user || !user.passwordHash) {
      await recordLoginFailure(db, { ip, email: body.email })
      return err('AUTH_INVALID_CREDENTIALS', 'Email or password is incorrect', 401)
    }
    if (user.status === 'suspended') return err('AUTH_ACCOUNT_SUSPENDED', 'Account suspended', 403)
    const ok = await verifyPassword(body.password, user.passwordHash)
    if (!ok) {
      await recordLoginFailure(db, { ip, email: body.email })
      return err('AUTH_INVALID_CREDENTIALS', 'Email or password is incorrect', 401)
    }
    await recordLoginSuccess(db, { ip, email: body.email })
    await db.collection('users').updateOne({ id: user.id }, { $set: { lastLoginAt: new Date().toISOString() } })
    return authJsonResponse(db, user, { device: body.device || '', deviceId: body.deviceId || '', ip, ua: request.headers.get('user-agent') || '' })
  }

  // POST /auth/forgot-password
  if (id === 'forgot-password' && method === 'POST') {
    const body = await request.json()
    const { destination } = body
    if (!destination) return err('VALIDATION_FAILED', 'destination required')
    const user = await db.collection('users').findOne({ $or: [{ email: destination }, { phone: destination }] })
    if (!user) return json({ ok: true }) // do not leak existence
    const channel = destination.includes('@')
      ? 'email'
      : (body.channel === 'whatsapp' ? 'whatsapp' : 'sms')
    const o = await issueOtp({ destination, purpose: 'reset', channel, ip: request.headers.get('x-forwarded-for') || '' })
    return json({ ok: true, channel, ...(o.devOtp ? { devOtp: o.devOtp } : {}) })
  }

  // POST /auth/reset-password
  if (id === 'reset-password' && method === 'POST') {
    const { destination, code, newPassword } = await request.json()
    if (!destination || !code || !newPassword) return err('VALIDATION_FAILED', 'destination, code, newPassword required')
    if (newPassword.length < 8) return err('VALIDATION_FAILED', 'newPassword must be \u22658 chars')
    const v = await verifyOtpCode({ destination, code, purpose: 'reset' })
    if (!v.ok) return err('AUTH_INVALID_CREDENTIALS', 'Invalid OTP', 401)
    const user = await db.collection('users').findOne({ $or: [{ email: destination }, { phone: destination }] })
    if (!user) return err('USER_NOT_FOUND', 'User not found', 404)
    await db.collection('users').updateOne({ id: user.id }, { $set: { passwordHash: await hashPassword(newPassword), updatedAt: new Date().toISOString() } })
    return json({ ok: true })
  }

  // POST /auth/refresh-token
  if (id === 'refresh-token' && method === 'POST') {
    const { refreshToken } = await request.json()
    if (!refreshToken) return err('AUTH_REFRESH_INVALID', 'refreshToken required', 401)
    await touchRefreshToken(refreshToken)
    const rotated = await rotateRefreshToken(refreshToken, { ip: request.headers.get('x-forwarded-for') || '', ua: request.headers.get('user-agent') || '' })
    if (!rotated) return err('AUTH_REFRESH_INVALID', 'Refresh token revoked or expired', 401)
    const user = await db.collection('users').findOne({ id: rotated.userId })
    if (!user) return err('AUTH_REFRESH_INVALID', 'User missing', 401)
    const access = signAccessToken({ userId: user.id, tenantId: user.orgId, role: user.role || 'admin', perms: [] })
    return json({
      accessToken: access, refreshToken: rotated.refreshToken,
      expiresIn: TOKEN_TTLS.access, tokenType: 'Bearer', user: pickUser(user),
    })
  }

  // POST /auth/logout  (mobile JWT version: revoke refresh token)
  if (id === 'logout' && method === 'POST') {
    try {
      const body = await request.json().catch(() => ({}))
      if (body.refreshToken) await revokeRefreshToken(body.refreshToken)
    } catch {}
    return json({ ok: true })
  }

  // POST /auth/logout-all — revoke all sessions except current device
  if (id === 'logout-all' && method === 'POST') {
    const a = await requireAuth(request); if (a.error) return a.error
    const body = await request.json().catch(() => ({}))
    if (body.refreshToken) {
      await revokeAllForUserExcept(a.user.id, hashRefreshToken(body.refreshToken))
    } else {
      const { revokeAllForUser } = await import('./jwt')
      await revokeAllForUser(a.user.id)
    }
    return json({ ok: true })
  }

  // GET /auth/sessions — list active device sessions
  if (id === 'sessions' && method === 'GET' && !action) {
    const a = await requireAuth(request); if (a.error) return a.error
    const sessions = await listUserSessions(a.user.id)
    return json({ sessions })
  }

  // DELETE /auth/sessions/:sessionId
  if (id === 'sessions' && method === 'DELETE' && action) {
    const a = await requireAuth(request); if (a.error) return a.error
    const ok = await revokeSessionById(a.user.id, action)
    if (!ok) return err('NOT_FOUND', 'Session not found', 404)
    return json({ ok: true })
  }

  // POST /auth/google — verify ID token (mobile)
  if (id === 'google' && method === 'POST') {
    if (!isGoogleAuthConfigured()) {
      return err('AUTH_GOOGLE_NOT_CONFIGURED', 'Google login not configured', 503)
    }
    const body = await request.json()
    if (!body.idToken) return err('VALIDATION_FAILED', 'idToken required')
    try {
      const profile = await verifyGoogleIdToken(body.idToken)
      let user = await db.collection('users').findOne({
        $or: [{ googleId: profile.googleId }, { email: profile.email }],
      })
      if (!user) {
        const orgId = uuid()
        await db.collection('orgs').insertOne({
          id: orgId,
          name: `${profile.fullName}'s Workspace`,
          ownerEmail: profile.email,
          plan: 'starter',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        })
        user = {
          id: uuid(), orgId,
          googleId: profile.googleId,
          email: profile.email, fullName: profile.fullName, picture: profile.picture,
          role: 'admin', status: 'active',
          businessSuiteEnabled: true, products: ['leadedge360'], activeProduct: 'leadedge360',
          emailVerified: true, phoneVerified: false,
          preferences: { notifications: { push: true, email: true, whatsapp: true } },
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        }
        await db.collection('users').insertOne(user)
      } else {
        await db.collection('users').updateOne({ id: user.id }, {
          $set: { googleId: profile.googleId, emailVerified: true, updatedAt: new Date().toISOString(), ...(user.status === 'invited' ? { status: 'active' } : {}) },
        })
        user = await db.collection('users').findOne({ id: user.id })
      }
      if (user.status === 'suspended') return err('AUTH_ACCOUNT_SUSPENDED', 'Account suspended', 403)
      await db.collection('users').updateOne({ id: user.id }, { $set: { lastLoginAt: new Date().toISOString() } })
      return json(await buildTokens(db, user, { device: body.device || 'android', ip: request.headers.get('x-forwarded-for') || '', ua: request.headers.get('user-agent') || '' }))
    } catch (e) {
      return err('AUTH_GOOGLE_FAILED', e.message || 'Google auth failed', 401)
    }
  }

  // POST /auth/oauth-complete — one-time web exchange code after Google redirect
  if (id === 'oauth-complete' && method === 'POST') {
    const { code } = await request.json()
    if (!code) return err('VALIDATION_FAILED', 'code required')
    const row = await db.collection('auth_exchange_codes').findOne({ code, consumedAt: null })
    if (!row || new Date(row.expiresAt).getTime() < Date.now()) {
      return err('AUTH_EXCHANGE_EXPIRED', 'Exchange code invalid or expired', 401)
    }
    await db.collection('auth_exchange_codes').updateOne({ code }, { $set: { consumedAt: new Date().toISOString() } })
    return json({
      accessToken: row.accessToken,
      refreshToken: row.refreshToken,
      expiresIn: row.expiresIn,
      tokenType: 'Bearer',
      user: row.user,
    })
  }

  return null
}

// =============================================================================
// =============================================================================
//  USERS  (current user / self-service)
// =============================================================================
// =============================================================================
async function handleUsers(method, id, request, db) {
  const a = await requireAuth(request); if (a.error) return a.error
  const user = a.user

  if (id === 'me' && method === 'GET') return json(pickUser(user))

  if (id === 'me' && method === 'PATCH') {
    const body = await request.json()
    const allowed = ['fullName', 'picture', 'phone', 'preferences']
    const update = { updatedAt: new Date().toISOString() }
    for (const k of allowed) if (k in body) update[k] = body[k]
    await db.collection('users').updateOne({ id: user.id }, { $set: update })
    const fresh = await db.collection('users').findOne({ id: user.id }, { projection: { _id: 0, passwordHash: 0 } })
    return json(fresh)
  }

  if (id === 'change-password' && method === 'POST') {
    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword) return err('VALIDATION_FAILED', 'currentPassword, newPassword required')
    if (newPassword.length < 8) return err('VALIDATION_FAILED', 'newPassword too short')
    const u = await db.collection('users').findOne({ id: user.id })
    if (!u.passwordHash || !(await verifyPassword(currentPassword, u.passwordHash)))
      return err('AUTH_INVALID_CREDENTIALS', 'Current password incorrect', 401)
    await db.collection('users').updateOne({ id: user.id }, { $set: { passwordHash: await hashPassword(newPassword), updatedAt: new Date().toISOString() } })
    return json({ ok: true })
  }

  if (id === 'subscription' && method === 'GET') {
    const org = await db.collection('orgs').findOne({ id: user.orgId }, { projection: { _id: 0 } })
    const sub = await db.collection('subscriptions').findOne(
      { orgId: user.orgId, status: { $in: ['ACTIVE', 'TRIAL', 'active', 'trialing'] } },
      { projection: { _id: 0 } }
    )
    return json({ plan: org?.plan || 'starter', subscription: sub || null })
  }

  return null
}

// =============================================================================
// =============================================================================
//  FOLLOW-UPS
// =============================================================================
// =============================================================================
async function handleFollowups(method, id, action, request, db) {
  const a = await requireAuth(request); if (a.error) return a.error
  const user = a.user
  const col = db.collection('follow_ups')

  if (!id && method === 'GET') {
    const url = new URL(request.url)
    const q = { orgId: user.orgId }
    const status = url.searchParams.get('status'); if (status) q.status = status
    const assignedTo = url.searchParams.get('assignedTo'); if (assignedTo) q.assignedToId = assignedTo
    const dueFrom = url.searchParams.get('dueFrom'); const dueTo = url.searchParams.get('dueTo')
    if (dueFrom || dueTo) q.dueAt = { ...(dueFrom ? { $gte: dueFrom } : {}), ...(dueTo ? { $lte: dueTo } : {}) }
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const pageSize = Math.min(100, parseInt(url.searchParams.get('pageSize') || '20'))
    const total = await col.countDocuments(q)
    const list = await col.find(q, { projection: { _id: 0 } }).sort({ dueAt: 1 }).skip((page - 1) * pageSize).limit(pageSize).toArray()
    return json({ followups: list, meta: { page, pageSize, total, hasMore: page * pageSize < total } })
  }

  if (!id && method === 'POST') {
    const body = await request.json()
    if (!body.leadId || !body.title || !body.dueAt) return err('VALIDATION_FAILED', 'leadId, title, dueAt required')
    const doc = {
      id: uuid(), orgId: user.orgId,
      leadId: body.leadId, title: body.title, notes: body.notes || '',
      dueAt: body.dueAt, channel: body.channel || 'call',
      assignedToId: body.assignedToId || user.id,
      status: 'open', reminderSent: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    await col.insertOne(doc)
    delete doc._id
    return json(doc, { status: 201 })
  }

  if (id && action === 'close' && method === 'POST') {
    const { outcome } = await request.json()
    const r = await col.findOneAndUpdate(
      { id, orgId: user.orgId },
      { $set: { status: 'done', outcome: outcome || '', closedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } },
      { returnDocument: 'after', projection: { _id: 0 } }
    )
    if (!r?.value && !r) return err('FOLLOWUP_NOT_FOUND', 'Follow-up not found', 404)
    return json(r?.value || r)
  }

  if (id && !action && method === 'PATCH') {
    const body = await request.json()
    const update = { updatedAt: new Date().toISOString() }
    for (const k of ['title', 'notes', 'dueAt', 'channel', 'assignedToId', 'status']) if (k in body) update[k] = body[k]
    const r = await col.findOneAndUpdate({ id, orgId: user.orgId }, { $set: update }, { returnDocument: 'after', projection: { _id: 0 } })
    return json(r?.value || r)
  }

  if (id && !action && method === 'DELETE') {
    await col.updateOne({ id, orgId: user.orgId }, { $set: { status: 'cancelled', updatedAt: new Date().toISOString() } })
    return json({ ok: true })
  }

  if (id === 'reminders' && method === 'GET') {
    const url = new URL(request.url)
    const hrs = parseInt(url.searchParams.get('withinHours') || '24')
    const now = new Date()
    const cutoff = new Date(now.getTime() + hrs * 3600 * 1000)
    const list = await col.find({
      orgId: user.orgId, status: 'open',
      dueAt: { $gte: now.toISOString(), $lte: cutoff.toISOString() },
    }, { projection: { _id: 0 } }).sort({ dueAt: 1 }).toArray()
    return json({ followups: list })
  }

  return null
}

// =============================================================================
// =============================================================================
//  DASHBOARD  (mobile-friendly summaries)
// =============================================================================
// =============================================================================
async function handleDashboard(method, id, request, db) {
  const a = await requireAuth(request); if (a.error) return a.error
  const user = a.user
  const orgId = user.orgId
  const leads = await db.collection('leads').find({ orgId }, { projection: { _id: 0 } }).toArray()

  if (id === 'kpis' && method === 'GET') {
    const total = leads.length
    const open = leads.filter(l => ['New', 'Contacted', 'Qualified', 'Proposal'].includes(l.status)).length
    const won  = leads.filter(l => l.status === 'Won').length
    const lost = leads.filter(l => l.status === 'Lost').length
    const qualified = leads.filter(l => ['Qualified', 'Proposal', 'Won'].includes(l.status)).length
    const hot  = leads.filter(l => l.label === 'Hot').length
    return json({
      totalLeads: total, openLeads: open, wonLeads: won, lostLeads: lost,
      qualifiedLeads: qualified, hotLeads: hot,
      conversion: total ? Math.round((won / total) * 1000) / 10 : 0,
      avgScore: total ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / total) : 0,
    })
  }

  if (id === 'followups-due' && method === 'GET') {
    const now = new Date().toISOString()
    const tomorrow = new Date(Date.now() + 86400000).toISOString()
    const due = await db.collection('follow_ups').find({
      orgId, status: 'open', dueAt: { $lte: tomorrow },
    }, { projection: { _id: 0 } }).sort({ dueAt: 1 }).toArray()
    const overdue = due.filter(f => f.dueAt < now).length
    return json({ dueWithin24h: due.length, overdue, followups: due })
  }

  if (id === 'revenue' && method === 'GET') {
    const url = new URL(request.url)
    const range = url.searchParams.get('range') || '30d'
    const days = { '7d': 7, '30d': 30, '90d': 90, ytd: 365 }[range] || 30
    const start = new Date(Date.now() - days * 86400000)
    const series = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
      const next = new Date(d); next.setDate(next.getDate() + 1)
      const won = leads.filter(l => l.status === 'Won' && new Date(l.updatedAt).getTime() >= d.getTime() && new Date(l.updatedAt).getTime() < next.getTime())
      series.push({
        date: d.toISOString().slice(0, 10),
        won: won.length,
        revenue: won.reduce((s, l) => s + (l.budget || 0), 0),
      })
    }
    return json({ range, series, total: series.reduce((s, p) => s + p.revenue, 0) })
  }

  if (id === 'sales-performance' && method === 'GET') {
    const byAgent = {}
    const byTerritory = {}
    for (const l of leads) {
      const a = l.assignedTo || 'Unassigned'
      const t = l.territory || 'Unknown'
      byAgent[a] = byAgent[a] || { name: a, leads: 0, won: 0, revenue: 0 }
      byAgent[a].leads += 1
      if (l.status === 'Won') { byAgent[a].won += 1; byAgent[a].revenue += (l.budget || 0) }
      byTerritory[t] = byTerritory[t] || { name: t, leads: 0, won: 0 }
      byTerritory[t].leads += 1
      if (l.status === 'Won') byTerritory[t].won += 1
    }
    return json({
      byAgent: Object.values(byAgent).map(a => ({ ...a, conversion: a.leads ? Math.round((a.won / a.leads) * 1000) / 10 : 0 })).sort((a, b) => b.revenue - a.revenue),
      byTerritory: Object.values(byTerritory).map(t => ({ ...t, conversion: t.leads ? Math.round((t.won / t.leads) * 1000) / 10 : 0 })),
    })
  }

  return null
}

// =============================================================================
// =============================================================================

// =============================================================================
//  PRODUCTS
// =============================================================================
async function handleProducts(method, id, action, request, db) {
  const a = await requireAuth(request);
  if (a.error) return a.error;

  const user = a.user;

  // GET /api/products
  if (!id && method === 'GET') {
    return json({
      products: user.products || ['leadedge360'],
      activeProduct: user.activeProduct ?? '',
      businessSuiteEnabled: user.businessSuiteEnabled ?? true,
      subscriptionTier: user.subscriptionTier || 'starter'
    });
  }

  // POST /api/products/switch
  if (id === 'switch' && method === 'POST') {
    const body = await request.json();
    const product = body.product;

    if (!product) {
      return err(
        'VALIDATION_FAILED',
        'product is required',
        400
      );
    }

    if (!Array.isArray(user.products) ||
        !user.products.includes(product)) {
      return err(
        'PERMISSION_DENIED',
        'Product access denied',
        403
      );
    }

    await db.collection('users').updateOne(
      { id: user.id },
      {
        $set: {
          activeProduct: product,
          updatedAt: new Date().toISOString()
        }
      }
    );

    return json({
      success: true,
      activeProduct: product
    });
  }

  return null;
}

//  WHATSAPP
// =============================================================================
// =============================================================================
async function handleWhatsapp(method, id, action, request, db) {
  const a = await requireAuth(request); if (a.error) return a.error
  const user = a.user

  const store = async (lead, payload) => {
    const doc = { id: uuid(), orgId: user.orgId, leadId: lead?.id || null, direction: 'outbound',
                  ...payload, createdAt: new Date().toISOString() }
    await db.collection('whatsapp_messages').insertOne(doc)
    delete doc._id
    return doc
  }

  if (id === 'send' && method === 'POST') {
    const { leadId, text } = await request.json()
    if (!leadId || !text) return err('VALIDATION_FAILED', 'leadId and text required')
    const lead = await db.collection('leads').findOne({ id: leadId, orgId: user.orgId })
    if (!lead) return err('LEAD_NOT_FOUND', 'Lead not found', 404)
    const r = await sendWhatsApp({ to: lead.phone.replace(/^\+/, ''), text })
    return json(await store(lead, {
      msgType: 'text', body: text,
      status: r.ok ? 'sent' : 'queued',
      waMessageId: r.waMessageId || null,
      meta: r,
    }), { status: 201 })
  }

  if (id === 'send-template' && method === 'POST') {
    const { leadId, templateName, params } = await request.json()
    if (!leadId || !templateName) return err('VALIDATION_FAILED', 'leadId and templateName required')
    const lead = await db.collection('leads').findOne({ id: leadId, orgId: user.orgId })
    if (!lead) return err('LEAD_NOT_FOUND', 'Lead not found', 404)
    const r = await sendWhatsApp({ to: lead.phone.replace(/^\+/, ''), templateName, params })
    return json(await store(lead, {
      msgType: 'template', templateName, params: params || [],
      status: r.ok ? 'sent' : 'queued',
      waMessageId: r.waMessageId || null,
      meta: r,
    }), { status: 201 })
  }

  if (id === 'conversation' && action && method === 'GET') {
    // /api/whatsapp/conversation/{leadId}
    const list = await db.collection('whatsapp_messages').find({ orgId: user.orgId, leadId: action }, { projection: { _id: 0 } }).sort({ createdAt: 1 }).toArray()
    return json({ messages: list })
  }

  return null
}

// =============================================================================
// =============================================================================
//  NOTIFICATIONS
// =============================================================================
// =============================================================================
async function handleNotifications(method, id, action, request, db) {
  const a = await requireAuth(request); if (a.error) return a.error
  const user = a.user
  const col = db.collection('notifications')

  if (!id && method === 'GET') {
    const url = new URL(request.url)
    const unread = url.searchParams.get('unreadOnly') === 'true'
    const q = { userId: user.id, ...(unread ? { readAt: null } : {}) }
    const list = await col.find(q, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(100).toArray()
    const unreadCount = await col.countDocuments({ userId: user.id, readAt: null })
    return json({ notifications: list, unread: unreadCount })
  }

  if (id && action === 'read' && method === 'POST') {
    await col.updateOne({ id, userId: user.id }, { $set: { readAt: new Date().toISOString(), status: 'read' } })
    return json({ ok: true })
  }

  if (id === 'devices' && method === 'POST') {
    const body = await request.json()
    if (!body.platform || !body.token) return err('VALIDATION_FAILED', 'platform and token required')
    await db.collection('push_devices').updateOne(
      { userId: user.id, token: body.token },
      { $set: { platform: body.platform, deviceName: body.deviceName || '', lastSeenAt: new Date().toISOString() },
        $setOnInsert: { id: uuid(), userId: user.id, token: body.token, createdAt: new Date().toISOString() } },
      { upsert: true }
    )
    return json({ ok: true }, { status: 201 })
  }

  if (id === 'settings' && method === 'GET') {
    const u = await db.collection('users').findOne({ id: user.id }, { projection: { _id: 0, preferences: 1 } })
    return json(u.preferences?.notifications || { push: true, email: true, whatsapp: true })
  }
  if (id === 'settings' && method === 'PATCH') {
    const body = await request.json()
    await db.collection('users').updateOne({ id: user.id }, { $set: { 'preferences.notifications': body, updatedAt: new Date().toISOString() } })
    return json({ ok: true })
  }

  return null
}

// =============================================================================
// =============================================================================
//  ADMIN
// =============================================================================
// =============================================================================
async function handleAdmin(method, segs, request, db) {
  const a = await requireAuth(request); if (a.error) return a.error
  const user = a.user
  if (!['admin', 'superadmin'].includes(user.role)) return err('PERMISSION_DENIED', 'Admin role required', 403)
  const [, root, id] = segs   // segs starts with 'admin'

  // /admin/users
  if (root === 'users') {
    if (!id && method === 'GET') {
      const list = await db.collection('users').find({ orgId: user.orgId }, { projection: { _id: 0, passwordHash: 0 } }).toArray()
      return json({ users: list })
    }
    if (!id && method === 'POST') {
      const body = await request.json()
      if (!body.email || !body.role) return err('VALIDATION_FAILED', 'email and role required')
      const exists = await db.collection('users').findOne({ email: body.email })
      if (exists) return err('AUTH_EMAIL_IN_USE', 'Email already in use', 409)
      const u = {
        id: uuid(), orgId: user.orgId, email: body.email, fullName: body.fullName || '',
        role: body.role, status: 'invited', emailVerified: false, phoneVerified: false,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }
      await db.collection('users').insertOne(u)
      delete u._id
      return json(u, { status: 201 })
    }
    if (id && method === 'PATCH') {
      const body = await request.json()
      const update = { updatedAt: new Date().toISOString() }
      for (const k of ['role', 'status', 'fullName']) if (k in body) update[k] = body[k]
      await db.collection('users').updateOne({ id, orgId: user.orgId }, { $set: update })
      return json({ ok: true })
    }
    if (id && method === 'DELETE') {
      await db.collection('users').updateOne({ id, orgId: user.orgId }, { $set: { status: 'deleted', updatedAt: new Date().toISOString() } })
      return json({ ok: true })
    }
  }

  if (root === 'roles' && method === 'GET') {
    const { getRolesCatalog } = await import('@/lib/billing/roles-catalog')
    return json({ roles: getRolesCatalog() })
  }

  if (root === 'subscriptions' && method === 'GET') {
    const list = await db.collection('subscriptions').find({ orgId: user.orgId }, { projection: { _id: 0 } }).toArray()
    return json({ subscriptions: list })
  }

  if (root === 'product-access' && method === 'GET') {
    const org = await db.collection('orgs').findOne({ id: user.orgId }, { projection: { _id: 0 } })
    return json({
      access: [
        { productCode: 'leadedge360',  enabled: true },
        { productCode: 'retailedge360', enabled: org?.retailEnabled ?? true },
      ],
    })
  }
  if (root === 'product-access' && method === 'POST') {
    const body = await request.json()
    const key = body.productCode === 'retailedge360' ? 'retailEnabled' : 'leadEnabled'
    await db.collection('orgs').updateOne({ id: user.orgId }, { $set: { [key]: !!body.enabled } })
    return json({ ok: true })
  }

  return null
}

// =============================================================================
// =============================================================================
//  PUBLIC EXPORT
// =============================================================================
// =============================================================================
export async function mobileRoute({ root, id, action, segs, method, request, db: existingDb }) {
  const db = existingDb || await getDb()
  if (root === 'auth')          return handleAuth(method, id, action, request, db)
  if (root === 'users')         return handleUsers(method, id, request, db)
  if (root === 'followups')     return handleFollowups(method, id, action, request, db)
  if (root === 'dashboard')     return handleDashboard(method, id, request, db)
  if (root === 'products')      return handleProducts(method, id, action, request, db)
  if (root === 'whatsapp')      return handleWhatsapp(method, id, action, request, db)
  if (root === 'notifications') return handleNotifications(method, id, action, request, db)
  if (root === 'admin')         return handleAdmin(method, segs, request, db)
  return null
}

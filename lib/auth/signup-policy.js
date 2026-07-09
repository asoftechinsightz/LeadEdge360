/** Whether self-service /signup is allowed (enterprise GA: disable when OTP channels absent). */

function isProductionLike() {
  const appEnv = (process.env.NEXT_PUBLIC_APP_ENV || '').toLowerCase()
  if (appEnv === 'production' || appEnv === 'uat') return true
  return process.env.NODE_ENV === 'production'
}

function hasOtpDeliveryChannel() {
  return !!(
    process.env.MSG91_AUTH_KEY
    || (process.env.SMTP_HOST && process.env.SMTP_USER)
  )
}

export function isPublicSignupEnabled() {
  const flag = (process.env.PUBLIC_SIGNUP_ENABLED || '').toLowerCase()
  if (flag === 'true') return true
  if (flag === 'false') return false
  if (isProductionLike()) return hasOtpDeliveryChannel()
  return true
}

export function publicSignupPolicy() {
  const enabled = isPublicSignupEnabled()
  return {
    enabled,
    reason: enabled
      ? null
      : 'Public signup is disabled. Contact your account manager or use pilot provisioning.',
    provisionHint: 'npm run pilot:provision',
    otpChannelConfigured: hasOtpDeliveryChannel(),
  }
}

export { hasOtpDeliveryChannel }

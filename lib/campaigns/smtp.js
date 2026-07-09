export function getSmtpReadiness() {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
  const recommended = ['SMTP_FROM']
  const missing = required.filter((k) => !process.env[k])
  const missingRecommended = recommended.filter((k) => !process.env[k])

  return {
    ready: missing.length === 0,
    configured: missing.length === 0,
    missing,
    missingRecommended,
    mode: missing.length === 0 ? 'live' : 'dry_run',
    host: process.env.SMTP_HOST || null,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : null,
    from: process.env.SMTP_FROM || process.env.SMTP_USER || null,
  }
}

export async function verifySmtpConnection() {
  const readiness = getSmtpReadiness()
  if (!readiness.ready) {
    return { ...readiness, verified: false, error: 'SMTP not configured' }
  }

  try {
    const transport = (await import('@/lib/email/transporter')).createTransporter()
    if (!transport) {
      return { ...readiness, verified: false, error: 'SMTP not configured' }
    }
    await transport.verify()
    return { ...readiness, verified: true }
  } catch (error) {
    return {
      ...readiness,
      verified: false,
      error: error.message || 'SMTP verification failed',
    }
  }
}

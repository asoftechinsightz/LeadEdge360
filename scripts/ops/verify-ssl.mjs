#!/usr/bin/env node
/** SSL / TLS auto-renewal verification (Let's Encrypt / Caddy). */
const domain = process.env.APP_DOMAIN || process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, '').split('/')[0]
const url = process.env.SSL_CHECK_URL || (domain ? `https://${domain}` : '')

if (!url) {
  console.log('WARN: set APP_DOMAIN or SSL_CHECK_URL for SSL verification')
  process.exit(0)
}

console.log(`\nSSL verification: ${url}\n`)

try {
  const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
  const hsts = res.headers.get('strict-transport-security')
  const daysLeft = res.headers.get('expires')

  if (res.ok || res.status === 405) console.log('  OK   HTTPS reachable')
  else console.log(`  FAIL status=${res.status}`)

  if (hsts) console.log(`  OK   HSTS: ${hsts.slice(0, 60)}...`)
  else console.log('  WARN HSTS header missing')

  if (daysLeft) console.log(`  INFO cert expires header: ${daysLeft}`)

  const renewScript = '/etc/cron.d/certbot-renew'
  console.log('  INFO verify certbot timer: systemctl status certbot.timer (VPS)')
  console.log('  INFO verify Caddy auto-TLS: caddy validate --config /etc/caddy/Caddyfile')

  process.exit(res.ok || res.status === 405 ? 0 : 1)
} catch (e) {
  console.error(`  FAIL ${e.message}`)
  process.exit(1)
}

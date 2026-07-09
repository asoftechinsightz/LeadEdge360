export function getWebhookBaseUrl() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.PUBLIC_URL || 'http://localhost:3000'
  return base.replace(/\/$/, '')
}

export function buildTenantWebhookUrl(integrationId, orgId) {
  return `${getWebhookBaseUrl()}/api/integrations/webhooks/${integrationId}?orgId=${encodeURIComponent(orgId)}`
}

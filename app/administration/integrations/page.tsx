'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { IntegrationCenter } from '@/components/integrations/IntegrationCenter'
import { IntegrationsSettingsPanel } from '@/components/settings/IntegrationsSettingsPanel'
import { Button } from '@/components/design-system/core/Button'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Badge } from '@/components/design-system/core/Badge'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/src/lib/api'
import { Mail, MessageCircle, CreditCard, BarChart2 } from 'lucide-react'

const FEATURED = [
  { id: 'gmail', label: 'Gmail Sync', icon: Mail, desc: 'Sync inbound/outbound email to lead timeline' },
  { id: 'microsoft365', label: 'Outlook Sync', icon: Mail, desc: 'Microsoft 365 email sync via Graph' },
  { id: 'facebook_leads', label: 'Meta Ads', icon: BarChart2, desc: 'Facebook Lead Ads + attribution' },
  { id: 'google_ads', label: 'Google Ads', icon: BarChart2, desc: 'Google Ads campaigns + ROAS' },
  { id: 'razorpay', label: 'Razorpay', icon: CreditCard, desc: 'Payments and subscription billing' },
  { id: 'whatsapp', label: 'WhatsApp Business', icon: MessageCircle, desc: 'Templates, threads, nurture' },
]

export default function AdministrationIntegrationsPage() {
  const profileQuery = useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: () => apiGet('/auth/me'),
    retry: false,
  })

  const integrationsQuery = useQuery({
    queryKey: ['integrations'],
    queryFn: () => apiGet('/integrations'),
    retry: false,
  })

  const role = String(profileQuery.data?.user?.role || '')
  const isAdmin = ['SUPER_ADMIN', 'ORG_ADMIN', 'admin', 'superadmin'].includes(role)
    || ['admin', 'superadmin'].includes(role.toLowerCase())

  const connected = new Set(
    (integrationsQuery.data?.integrations || [])
      .filter((i: { status?: string }) => i.status === 'connected')
      .map((i: { id: string }) => i.id),
  )

  return (
    <div className="space-y-8 max-w-5xl">
      <PageHeader
        title="Integrations"
        description="Connect Gmail, Outlook, Meta Ads, Google Ads, Razorpay, and WhatsApp Business."
        actions={
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/settings">Workspace settings</Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED.map((item) => {
          const Icon = item.icon
          const isConnected = connected.has(item.id)
          return (
            <Card key={item.id} className="bg-card/60 border-border/60">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-primary shrink-0" />
                    <h3 className="font-medium text-sm">{item.label}</h3>
                  </div>
                  <Badge variant={isConnected ? 'default' : 'outline'} className="text-[10px] shrink-0">
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <IntegrationCenter isAdmin={isAdmin} />

      <div className="pt-4 border-t border-border/60">
        <h2 className="text-lg font-semibold mb-4">SSO &amp; email sync</h2>
        <IntegrationsSettingsPanel />
      </div>
    </div>
  )
}

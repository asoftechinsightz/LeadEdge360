'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPut } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Shield, Mail, Building2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

type SsoProviders = {
  saml?: {
    enabled?: boolean
    idpSsoUrl?: string
    idpEntityId?: string
    allowedDomains?: string[] | string
  }
  google_workspace?: {
    enabled?: boolean
    hostedDomain?: string
  }
}

type IntegrationsSettingsData = {
  sso?: {
    enabled?: boolean
    providers?: SsoProviders
  }
  emailSync?: Record<string, {
    connected?: boolean
    emailSyncEnabled?: boolean
    lastSyncAt?: string | null
  }>
}

function domainsToString(domains?: string[] | string) {
  if (!domains) return ''
  return Array.isArray(domains) ? domains.join(', ') : String(domains)
}

export function IntegrationsSettingsPanel() {
  const queryClient = useQueryClient()
  const settingsQuery = useQuery({
    queryKey: ['settings', 'integrations'],
    queryFn: () => apiGet('/settings/integrations'),
    retry: false,
  })

  const [samlEnabled, setSamlEnabled] = useState(false)
  const [samlIdpUrl, setSamlIdpUrl] = useState('')
  const [samlEntityId, setSamlEntityId] = useState('')
  const [samlDomains, setSamlDomains] = useState('')
  const [gwEnabled, setGwEnabled] = useState(false)
  const [gwDomain, setGwDomain] = useState('')
  const [gmailSync, setGmailSync] = useState(true)
  const [outlookSync, setOutlookSync] = useState(true)

  useEffect(() => {
    const data = settingsQuery.data as IntegrationsSettingsData | undefined
    if (!data?.sso) return
    const saml = data.sso.providers?.saml
    const gw = data.sso.providers?.google_workspace
    setSamlEnabled(!!saml?.enabled)
    setSamlIdpUrl(saml?.idpSsoUrl || '')
    setSamlEntityId(saml?.idpEntityId || '')
    setSamlDomains(domainsToString(saml?.allowedDomains))
    setGwEnabled(!!gw?.enabled)
    setGwDomain(gw?.hostedDomain || '')
    setGmailSync(data.emailSync?.gmail?.emailSyncEnabled !== false)
    setOutlookSync(data.emailSync?.microsoft365?.emailSyncEnabled !== false)
  }, [settingsQuery.data])

  const saveMutation = useMutation({
    mutationFn: (body: object) => apiPut('/settings/integrations', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'integrations'] })
      toast.success('Integration settings saved')
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to save settings'),
  })

  const data = settingsQuery.data as IntegrationsSettingsData | undefined
  const orgId = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('currentUser') || '{}')?.orgId
    : null

  function handleSave() {
    saveMutation.mutate({
      sso: {
        enabled: samlEnabled || gwEnabled,
        saml: {
          enabled: samlEnabled,
          idpSsoUrl: samlIdpUrl.trim(),
          idpEntityId: samlEntityId.trim(),
          allowedDomains: samlDomains,
        },
        google_workspace: {
          enabled: gwEnabled,
          hostedDomain: gwDomain.trim().replace(/^@/, ''),
        },
      },
      emailSync: {
        gmail: { emailSyncEnabled: gmailSync },
        microsoft365: { emailSyncEnabled: outlookSync },
      },
    })
  }

  if (settingsQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading integration settings…</p>
  }

  if (settingsQuery.isError) {
    return (
      <Card className="bg-card/60">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Enterprise integration settings require admin access.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/60">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h2 className="font-semibold">Single Sign-On (SSO)</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Let your team sign in with SAML 2.0 or Google Workspace. Users on matching email domains will see SSO on the sign-in page.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SAML 2.0</p>
                <p className="text-xs text-muted-foreground">Okta, Azure AD, OneLogin, and other IdPs</p>
              </div>
              <Switch checked={samlEnabled} onCheckedChange={setSamlEnabled} />
            </div>

            {samlEnabled && (
              <div className="grid gap-4 md:grid-cols-2 pl-0 md:pl-2 border-l-0 md:border-l-2 border-border/60 md:ml-2 md:pl-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="saml-idp-url">IdP SSO URL</Label>
                  <Input
                    id="saml-idp-url"
                    placeholder="https://idp.example.com/sso/saml"
                    value={samlIdpUrl}
                    onChange={(e) => setSamlIdpUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saml-entity">IdP Entity ID (optional)</Label>
                  <Input
                    id="saml-entity"
                    placeholder="urn:example:idp"
                    value={samlEntityId}
                    onChange={(e) => setSamlEntityId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saml-domains">Allowed email domains</Label>
                  <Input
                    id="saml-domains"
                    placeholder="acme.com, acme.co.in"
                    value={samlDomains}
                    onChange={(e) => setSamlDomains(e.target.value)}
                  />
                </div>
                {orgId && (
                  <div className="md:col-span-2 text-xs text-muted-foreground space-y-1">
                    <p>SP Metadata URL for your IdP:</p>
                    <code className="block rounded bg-muted px-2 py-1 break-all">
                      {typeof window !== 'undefined' ? `${window.location.origin}/api/auth/sso/saml/metadata?orgId=${orgId}` : ''}
                    </code>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Google Workspace SSO</p>
                  <p className="text-xs text-muted-foreground">Restrict sign-in to your Google hosted domain</p>
                </div>
              </div>
              <Switch checked={gwEnabled} onCheckedChange={setGwEnabled} />
            </div>

            {gwEnabled && (
              <div className="space-y-2 md:ml-2 md:pl-4 md:border-l-2 border-border/60 max-w-md">
                <Label htmlFor="gw-domain">Hosted domain</Label>
                <Input
                  id="gw-domain"
                  placeholder="company.com"
                  value={gwDomain}
                  onChange={(e) => setGwDomain(e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h2 className="font-semibold">Email sync to lead timeline</h2>
              <p className="text-sm text-muted-foreground mt-1">
                When connected, inbound and outbound emails are automatically logged on matching lead records.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Gmail sync</p>
                <p className="text-xs text-muted-foreground">
                  {data?.emailSync?.gmail?.connected ? (
                    <Badge variant="outline" className="mt-1">Connected</Badge>
                  ) : (
                    <span className="text-amber-600">Connect Gmail in Integration Center first</span>
                  )}
                </p>
              </div>
              <Switch
                checked={gmailSync}
                onCheckedChange={setGmailSync}
                disabled={!data?.emailSync?.gmail?.connected}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Outlook / Microsoft 365 sync</p>
                <p className="text-xs text-muted-foreground">
                  {data?.emailSync?.microsoft365?.connected ? (
                    <Badge variant="outline" className="mt-1">Connected</Badge>
                  ) : (
                    <span className="text-amber-600">Connect Microsoft 365 in Integration Center first</span>
                  )}
                </p>
              </div>
              <Switch
                checked={outlookSync}
                onCheckedChange={setOutlookSync}
                disabled={!data?.emailSync?.microsoft365?.connected}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving…' : 'Save integration settings'}
        </Button>
        <Button asChild variant="outline">
          <Link href="/settings?tab=integrations">Open Integration Center</Link>
        </Button>
      </div>
    </div>
  )
}

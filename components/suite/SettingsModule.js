'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api, apiGet } from '@/src/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BrandingSettingsForm } from '@/components/settings/BrandingSettingsForm'
import { AIWorkforceSettings } from '@/components/settings/AIWorkforceSettings'
import { IntegrationCenter } from '@/components/integrations/IntegrationCenter'
import PrivacyDataPanel from '@/components/settings/PrivacyDataPanel'
import { DemoDataPanel } from '@/components/settings/DemoDataPanel'
import { IntegrationsSettingsPanel } from '@/components/settings/IntegrationsSettingsPanel'
import { SLADashboard } from '@/components/support/SLADashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/design-system/core/Tabs'

export function SettingsModule() {
  const [notifPrefs, setNotifPrefs] = useState(null)
  const [notifSaving, setNotifSaving] = useState(false)

  const profileQuery = useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: () => apiGet('/auth/me'),
    retry: false,
  })

  const companyQuery = useQuery({
    queryKey: ['settings', 'company'],
    queryFn: () => apiGet('/onboarding/status'),
  })

  const usersQuery = useQuery({
    queryKey: ['settings', 'users'],
    queryFn: () => apiGet('/agents'),
  })

  const rolesQuery = useQuery({
    queryKey: ['settings', 'roles'],
    queryFn: () => apiGet('/admin/roles'),
    retry: false,
  })

  const billingQuery = useQuery({
    queryKey: ['settings', 'billing'],
    queryFn: () => apiGet('/users/subscription'),
    retry: false,
  })

  const notifQuery = useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: async () => {
      const data = await apiGet('/notifications/settings')
      setNotifPrefs(data)
      return data
    },
    retry: false,
  })

  const profile = profileQuery.data?.user
  const status = companyQuery.data
  const agents = usersQuery.data?.agents || []
  const roles = rolesQuery.data?.roles || []
  const subscription = billingQuery.data

  const completed = status
    ? [status.companyProfile, status.branding, status.team, status.whatsapp, status.email].filter(Boolean).length
    : 0
  const percent = completed * 20

  const saveNotifications = async () => {
    if (!notifPrefs) return
    setNotifSaving(true)
    try {
      await api.patch('/notifications/settings', notifPrefs)
    } finally {
      setNotifSaving(false)
    }
  }

  const prefs = notifPrefs || notifQuery.data || { push: true, email: true, whatsapp: true }

  const role = String(profile?.role || '')
  const isIntegrationAdmin = ['SUPER_ADMIN', 'ORG_ADMIN', 'admin', 'superadmin'].includes(role)
    || ['admin', 'superadmin'].includes(role.toLowerCase())

  return (
    <div className="max-w-5xl">
      <Tabs defaultValue="profile">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
          <TabsTrigger value="security-sso">Security &amp; SSO</TabsTrigger>
          <TabsTrigger value="ai-workforce">AI Workforce</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-card/60">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Profile</h2>
              {profileQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading profile…</p>
              ) : profileQuery.isError ? (
                <p className="text-sm text-muted-foreground">Profile details unavailable.</p>
              ) : (
                <dl className="space-y-3 text-sm">
                  <div><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{profile?.fullName || profile?.name || '—'}</dd></div>
                  <div><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{profile?.email || '—'}</dd></div>
                  <div><dt className="text-muted-foreground">Role</dt><dd><Badge variant="outline">{profile?.role || 'agent'}</Badge></dd></div>
                </dl>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card className="bg-card/60">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Company setup</h2>
              {companyQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading company status…</p>
              ) : (
                <>
                  <div className="w-full bg-muted rounded-full h-3 mb-4">
                    <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{percent}% complete</p>
                  <ul className="space-y-2 text-sm">
                    <li>Company Profile: {status?.companyProfile ? '✅' : '❌'}</li>
                    <li>Branding: {status?.branding ? '✅' : '❌'}</li>
                    <li>Team: {status?.team ? '✅' : '❌'}</li>
                    <li>WhatsApp: {status?.whatsapp ? '✅' : '❌'}</li>
                    <li>Email: {status?.email ? '✅' : '❌'}</li>
                  </ul>
                  <div className="mt-6 pt-4 border-t border-border/60">
                    <p className="text-sm text-muted-foreground mb-3">
                      Set up your digital business card — logo, contact links, and a shareable public URL.
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/growth/business-card">Edit Business Card</Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <BrandingSettingsForm />
        </TabsContent>

        <TabsContent value="users">
          <Card className="bg-card/60">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Users</h2>
              {usersQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading team…</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Territory</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((a) => (
                      <TableRow key={a.id || a.email}>
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell>{a.email || '—'}</TableCell>
                        <TableCell>{a.territory || '—'}</TableCell>
                        <TableCell><Badge variant="outline">{a.role || 'agent'}</Badge></TableCell>
                      </TableRow>
                    ))}
                    {agents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No users found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card className="bg-card/60">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Roles</h2>
              {rolesQuery.isError ? (
                <p className="text-sm text-muted-foreground">Roles require admin access.</p>
              ) : rolesQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading roles…</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((r) => (
                      <TableRow key={r.name}>
                        <TableCell className="font-medium capitalize">{r.name}</TableCell>
                        <TableCell>{r.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card className="bg-card/60">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Permissions</h2>
              {rolesQuery.isError ? (
                <p className="text-sm text-muted-foreground">Permissions require admin access.</p>
              ) : rolesQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading permissions…</p>
              ) : (
                <div className="space-y-4">
                  {roles.map((r) => (
                    <div key={r.name}>
                      <p className="font-medium capitalize mb-2">{r.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {(r.permissions || []).map((p) => (
                          <Badge key={p} variant="secondary">{p}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="bg-card/60">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Billing</h2>
              {billingQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading subscription…</p>
              ) : billingQuery.isError ? (
                <p className="text-sm text-muted-foreground mb-4">Subscription details unavailable.</p>
              ) : (
                <dl className="space-y-3 text-sm mb-6">
                  <div><dt className="text-muted-foreground">Plan</dt><dd className="font-medium">{subscription?.planName || subscription?.plan || '—'}</dd></div>
                  <div><dt className="text-muted-foreground">Status</dt><dd><Badge variant="outline">{subscription?.status || '—'}</Badge></dd></div>
                  {subscription?.currentPeriodEnd && (
                    <div><dt className="text-muted-foreground">Renews</dt><dd className="font-medium">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</dd></div>
                  )}
                </dl>
              )}
              <Button asChild variant="outline">
                <Link href="/payments">Open Billing Center</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-card/60">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Notifications</h2>
              {notifQuery.isError ? (
                <p className="text-sm text-muted-foreground">Notification settings unavailable.</p>
              ) : notifQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading notification preferences…</p>
              ) : (
                <div className="space-y-4">
                  {['push', 'email', 'whatsapp'].map((key) => (
                    <label key={key} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{key}</span>
                      <input
                        type="checkbox"
                        checked={!!prefs[key]}
                        onChange={(e) => setNotifPrefs({ ...prefs, [key]: e.target.checked })}
                      />
                    </label>
                  ))}
                  <Button onClick={saveNotifications} disabled={notifSaving}>
                    {notifSaving ? 'Saving…' : 'Save preferences'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <div className="space-y-6">
            <DemoDataPanel />
            <PrivacyDataPanel />
          </div>
        </TabsContent>

        <TabsContent value="security-sso">
          <div className="space-y-6">
            <IntegrationsSettingsPanel />
            <SLADashboard />
          </div>
        </TabsContent>

        <TabsContent value="ai-workforce">
          <AIWorkforceSettings />
        </TabsContent>

        <TabsContent value="integrations">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Connect channels, then configure enterprise SSO and email timeline sync.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/settings/integrations">SSO &amp; email sync</Link>
            </Button>
          </div>
          <IntegrationCenter isAdmin={isIntegrationAdmin} />
        </TabsContent>

        <TabsContent value="support">
          <SLADashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

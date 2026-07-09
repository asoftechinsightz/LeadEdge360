'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/src/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CONSENT_COPY } from '@/lib/consent-versions'
import { toast } from 'sonner'

export default function PrivacyDataPanel() {
  const [deleteReason, setDeleteReason] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)

  const profileQuery = useQuery({
    queryKey: ['privacy', 'profile'],
    queryFn: () => apiGet('/auth/me'),
  })

  const historyQuery = useQuery({
    queryKey: ['privacy', 'consent-history'],
    queryFn: () => apiGet('/privacy/consent-history'),
    retry: false,
  })

  const profile = profileQuery.data?.user
  const consent = profile?.dpdpConsent

  useEffect(() => {
    if (consent?.marketingConsent != null) setMarketingConsent(!!consent.marketingConsent)
  }, [consent?.marketingConsent])

  const exportMutation = useMutation({
    mutationFn: () => apiGet('/privacy/export'),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `asoftechinsightz-data-export-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Personal data downloaded')
    },
    onError: (e) => toast.error(e.message || 'Export failed'),
  })

  const marketingMutation = useMutation({
    mutationFn: (accepted) => apiPost('/privacy/consent', {
      accepted: true,
      marketingConsent: accepted,
      termsAccepted: consent?.termsAccepted ?? true,
      dataProcessingAccepted: consent?.dataProcessingAccepted ?? true,
      version: '2.0',
    }),
    onSuccess: () => {
      toast.success('Marketing preference updated')
      profileQuery.refetch()
      historyQuery.refetch()
    },
    onError: (e) => toast.error(e.message || 'Update failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => apiPost('/privacy/delete-request', { reason: deleteReason }),
    onSuccess: () => {
      toast.success('Account deletion request submitted. Our team will contact you.')
      setDeleteReason('')
    },
    onError: (e) => toast.error(e.message || 'Request failed'),
  })

  const history = historyQuery.data?.history || []

  return (
    <div className="space-y-6">
      <Card className="bg-card/60">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold">Personal information</h2>
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{profile?.fullName || '—'}</dd></div>
            <div><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{profile?.email || '—'}</dd></div>
            <div><dt className="text-muted-foreground">Phone</dt><dd className="font-medium">{profile?.phone || '—'}</dd></div>
            <div><dt className="text-muted-foreground">Consent version</dt><dd className="font-medium">{consent?.consentVersion || consent?.version || '—'}</dd></div>
          </dl>
          <p className="text-xs text-muted-foreground">
            Update profile fields in the Profile tab. For corrections, contact{' '}
            <a href="mailto:privacy@asoftechinsightz.com" className="text-primary hover:underline">privacy@asoftechinsightz.com</a>.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold">Download your data</h2>
          <p className="text-sm text-muted-foreground">
            Export a JSON copy of your profile and related records stored in your workspace (DPDP right to access).
          </p>
          <Button variant="outline" onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? 'Preparing…' : 'Download personal data'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold">Marketing communications</h2>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={marketingConsent}
              onCheckedChange={(v) => {
                const next = !!v
                setMarketingConsent(next)
                marketingMutation.mutate(next)
              }}
            />
            <Label className="text-sm text-muted-foreground font-normal leading-relaxed cursor-pointer">
              {CONSENT_COPY.marketingLabel}
            </Label>
          </label>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold">Consent history</h2>
          {historyQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No consent events recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
              {history.map((row) => (
                <li key={row.id} className="rounded-lg border border-border/60 p-3">
                  <div className="font-medium">{row.event || 'consent'}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {row.loggedAt || row.acceptedAt} · v{row.consentVersion || row.version || '—'}
                    {row.registrationMethod ? ` · ${row.registrationMethod}` : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link href="/privacy" className="text-sm text-primary hover:underline">Read Privacy Policy</Link>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-destructive/30">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-destructive">Delete account</h2>
          <p className="text-sm text-muted-foreground">
            Request permanent deletion of your account and personal data. We will verify your identity and process the request per the DPDP Act.
          </p>
          <Textarea
            placeholder="Optional reason for deletion"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            rows={3}
          />
          <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Submitting…' : 'Request account deletion'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

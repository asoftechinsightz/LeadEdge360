'use client'

import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { apiPost } from '@/src/lib/api'
import { Button } from '@/components/design-system/core/Button'
import { MessageCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export type LeadDetailActionsProps = {
  leadId: string
  lead: {
    id?: string
    name?: string
    phone?: string
    company?: string
    lastWhatsAppAt?: string
  }
  onSent?: () => void
}

export function LeadDetailActions({ leadId, lead, onSent }: LeadDetailActionsProps) {
  const hasPhone = Boolean(lead?.phone?.trim())

  const introMutation = useMutation({
    mutationFn: () => apiPost(`/leads/${leadId}/whatsapp-intro`, {}),
    onSuccess: (data) => {
      if (data?.locked) {
        toast.error('Upgrade to unlock WhatsApp Pro', {
          description: data.message,
          action: data.upgradeUrl
            ? { label: 'Upgrade', onClick: () => { window.location.href = data.upgradeUrl } }
            : undefined,
        })
        return
      }
      toast.success('WhatsApp intro sent', {
        description: data.previewText?.slice(0, 120) || 'Message queued for delivery.',
      })
      onSent?.()
    },
    onError: (err: { message?: string; code?: string; locked?: boolean; upgradeUrl?: string }) => {
      if (err.locked || err.code === 'FEATURE_LOCKED') {
        toast.error('Upgrade to unlock WhatsApp Pro', {
          description: err.message,
          action: err.upgradeUrl
            ? { label: 'Upgrade', onClick: () => { window.location.href = err.upgradeUrl! } }
            : undefined,
        })
        return
      }
      if (err.code === 'PLAN_UPGRADE_REQUIRED') {
        toast.error('WhatsApp Pro required', {
          description: err.message,
          action: err.upgradeUrl
            ? { label: 'Upgrade', onClick: () => { window.location.href = err.upgradeUrl! } }
            : undefined,
        })
        return
      }
      toast.error(err.message || 'Failed to send WhatsApp intro')
    },
  })

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="lg"
        disabled={!hasPhone || introMutation.isPending}
        onClick={() => introMutation.mutate()}
        className="rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white shadow-md shadow-emerald-500/20 border-0 font-semibold"
        data-tour="whatsapp-intro"
      >
        {introMutation.isPending ? (
          <Loader2 className="size-5 mr-2 animate-spin" />
        ) : introMutation.isSuccess ? (
          <CheckCircle2 className="size-5 mr-2" />
        ) : (
          <MessageCircle className="size-5 mr-2 fill-white/20" />
        )}
        {introMutation.isPending ? 'Sending…' : 'Send WhatsApp Intro'}
      </Button>

      {!hasPhone && (
        <span className="text-xs text-muted-foreground">Add a phone number to send WhatsApp</span>
      )}

      {lead?.lastWhatsAppAt && (
        <span className="text-xs text-muted-foreground">
          Last WhatsApp: {new Date(lead.lastWhatsAppAt).toLocaleString()}
        </span>
      )}

      <Button asChild variant="outline" size="sm" className="rounded-full">
        <Link href={`/campaigns?channel=whatsapp&leadId=${leadId}`}>More templates</Link>
      </Button>
    </div>
  )
}

export default LeadDetailActions

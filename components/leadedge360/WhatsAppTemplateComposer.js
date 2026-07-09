'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/src/lib/api'
import { Button } from '@/components/design-system/core/Button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { FileText } from 'lucide-react'

export function WhatsAppTemplateComposer({ threadId, onSent }) {
  const [open, setOpen] = useState(false)
  const [params, setParams] = useState([])
  const [selectedName, setSelectedName] = useState('')
  const [sending, setSending] = useState(false)

  const templatesQuery = useQuery({
    queryKey: ['whatsapp', 'templates'],
    queryFn: () => apiGet('/whatsapp/templates'),
    enabled: open,
  })

  const templates = templatesQuery.data?.items || []
  const selected = templates.find((t) => t.name === selectedName) || templates[0]

  const selectTemplate = (name) => {
    setSelectedName(name)
    const tpl = templates.find((t) => t.name === name)
    setParams((tpl?.params || []).map(() => ''))
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <FileText className="h-4 w-4 mr-1" /> Template
      </Button>
    )
  }

  const preview = selected?.body
    ? selected.body.replace(/\{\{(\d+)\}\}/g, (_, n) => params[Number(n) - 1] || `{{${n}}}`)
    : ''

  const handleSend = async () => {
    if (!threadId || !selected?.name) return
    const missing = (selected.params || []).some((_, i) => !params[i]?.trim())
    if (missing) {
      toast.error('Fill all template parameters')
      return
    }
    setSending(true)
    try {
      await apiPost(`/whatsapp/threads/${threadId}/messages`, {
        templateName: selected.name,
        params: params.map((p) => p.trim()),
      })
      toast.success('Template sent')
      setOpen(false)
      onSent?.()
    } catch (err) {
      toast.error(err.message || 'Send failed')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-3 mb-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Send WhatsApp template</p>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Close</Button>
      </div>
      {templatesQuery.isLoading ? (
        <p className="text-xs text-muted-foreground">Loading templates…</p>
      ) : (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Template</Label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={selected?.name || ''}
              onChange={(e) => selectTemplate(e.target.value)}
            >
              {templates.map((t) => (
                <option key={t.name} value={t.name}>{t.label || t.name}</option>
              ))}
            </select>
          </div>
          {(selected?.params || []).map((label, i) => (
            <div key={label} className="space-y-1">
              <Label className="text-xs capitalize">{label}</Label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={params[i] || ''}
                onChange={(e) => {
                  const next = [...params]
                  next[i] = e.target.value
                  setParams(next)
                }}
              />
            </div>
          ))}
          {preview ? (
            <div className="rounded-md bg-background border border-border/40 p-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Preview: </span>{preview}
            </div>
          ) : null}
          <Button type="button" size="sm" disabled={sending} onClick={handleSend}>
            {sending ? 'Sending…' : 'Send template'}
          </Button>
        </>
      )}
    </div>
  )
}

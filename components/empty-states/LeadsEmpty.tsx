'use client'

import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Database, Play, Loader2 } from 'lucide-react'
import { Button } from '@/components/design-system/core/Button'
import { EmptyState } from '@/components/design-system/core/EmptyState'
import { apiPost } from '@/src/lib/api'
import { toast } from 'sonner'

const DEMO_VIDEO_URL =
  process.env.NEXT_PUBLIC_LEADEDGE_DEMO_VIDEO
  || 'https://www.youtube.com/embed/jNQXAC9IVRw?rel=0&modestbranding=1'

type LeadsEmptyProps = {
  onImported?: () => void
  className?: string
}

export function LeadsEmpty({ onImported, className }: LeadsEmptyProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const [videoPlaying, setVideoPlaying] = useState(false)

  const importMutation = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return fetch('/api/leads/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
        body: form,
      }).then(async (res) => {
        const data = await res.json()
        if (!res.ok && !data.locked) throw new Error(data.message || 'Import failed')
        return data
      })
    },
    onSuccess: (data) => {
      if (data.locked) {
        toast.error('Upgrade to unlock CSV import', {
          action: data.upgradeUrl
            ? { label: 'Upgrade', onClick: () => { window.location.href = data.upgradeUrl } }
            : undefined,
        })
        return
      }
      toast.success(`Imported ${data.imported || 0} leads`)
      queryClient.invalidateQueries({ queryKey: ['sales-leads'] })
      onImported?.()
    },
    onError: (err: Error) => toast.error(err.message || 'Import failed'),
  })

  const demoMutation = useMutation({
    mutationFn: () => apiPost('/leads/demo-data', {}),
    onSuccess: (data) => {
      toast.success(`Added ${data.leadsCreated || 10} demo leads`)
      queryClient.invalidateQueries({ queryKey: ['sales-leads'] })
      onImported?.()
    },
    onError: (err: Error) => toast.error(err.message || 'Could not add demo data'),
  })

  return (
    <div className={className}>
      <EmptyState
        title="No leads yet"
        description="Import your pipeline, seed demo data, or watch a quick walkthrough to get started."
        className="border-none bg-transparent py-8"
      />

      <div className="mx-auto max-w-2xl space-y-6 px-4 pb-8">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/20">
          {!videoPlaying ? (
            <button
              type="button"
              onClick={() => setVideoPlaying(true)}
              className="flex w-full items-center justify-center gap-3 py-10 text-sm text-muted-foreground hover:bg-muted/40 transition-colors"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Play className="size-5 ml-0.5" />
              </span>
              <span>Watch: LeadEdge360 in 2 minutes</span>
            </button>
          ) : (
            <div className="aspect-video w-full">
              <iframe
                title="LeadEdge360 product tour"
                src={DEMO_VIDEO_URL}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) importMutation.mutate(file)
              e.target.value = ''
            }}
          />
          <Button
            variant="outline"
            className="rounded-full"
            disabled={importMutation.isPending}
            onClick={() => fileRef.current?.click()}
          >
            {importMutation.isPending ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Upload className="size-4 mr-2" />
            )}
            Import CSV
          </Button>
          <Button
            className="rounded-full"
            disabled={demoMutation.isPending}
            onClick={() => demoMutation.mutate()}
          >
            {demoMutation.isPending ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Database className="size-4 mr-2" />
            )}
            Add Demo Data
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          CSV columns: name, email, phone, company, source, territory, budget
        </p>
      </div>
    </div>
  )
}

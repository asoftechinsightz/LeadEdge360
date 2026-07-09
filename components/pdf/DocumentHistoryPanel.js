'use client'

import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/src/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { History } from 'lucide-react'

function formatAction(action) {
  return String(action || '')
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
}

export function DocumentHistoryPanel({ docType, docId, trigger }) {
  const historyQuery = useQuery({
    queryKey: ['document-history', docType, docId],
    queryFn: () => apiGet(`/${docType === 'proposal' ? 'proposals' : 'invoices'}/${docId}/history`),
    enabled: false,
  })

  const versions = historyQuery.data?.versions || []
  const audit = historyQuery.data?.audit || []

  return (
    <Dialog onOpenChange={(open) => { if (open) historyQuery.refetch() }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" size="sm" variant="outline">
            <History className="h-4 w-4 mr-1" /> History
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Version history & audit trail</DialogTitle>
        </DialogHeader>

        {historyQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-6">
            <section>
              <h4 className="text-sm font-medium mb-2">Versions</h4>
              {versions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No versions recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {versions.map((v) => (
                    <li key={v.id} className="rounded-lg border border-border/60 p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">v{v.version}</span>
                        <Badge variant="outline">{v.documentNumber}</Badge>
                      </div>
                      <p className="text-muted-foreground text-xs mt-1">{v.note || '—'}</p>
                      <p className="text-muted-foreground text-xs">
                        {v.createdAt ? new Date(v.createdAt).toLocaleString() : '—'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h4 className="text-sm font-medium mb-2">Audit trail</h4>
              {audit.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity logged yet.</p>
              ) : (
                <ul className="space-y-2">
                  {audit.map((a) => (
                    <li key={a.id} className="rounded-lg border border-border/60 p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium capitalize">{formatAction(a.action)}</span>
                        <span className="text-xs text-muted-foreground">
                          {a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}
                        </span>
                      </div>
                      {a.detail && <p className="text-muted-foreground text-xs mt-1">{a.detail}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

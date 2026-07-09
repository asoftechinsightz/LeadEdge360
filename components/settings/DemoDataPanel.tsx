'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiDelete } from '@/src/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Database, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function DemoDataPanel() {
  const queryClient = useQueryClient()

  const clearMutation = useMutation({
    mutationFn: () => apiDelete('/leads/demo-data'),
    onSuccess: (data) => {
      toast.success(data.message || 'Demo data cleared')
      queryClient.invalidateQueries({ queryKey: ['sales-leads'] })
      queryClient.invalidateQueries({ queryKey: ['lead-onboarding-status'] })
    },
    onError: (err: { message?: string }) => toast.error(err.message || 'Could not clear demo data'),
  })

  return (
    <Card className="bg-card/60 border-amber-500/20">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Database className="size-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Demo data</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Trial workspaces may include sample leads, opportunities, and proposals flagged as demo data.
              Clear them when you are ready to work with real pipeline records.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
          disabled={clearMutation.isPending}
          onClick={() => {
            if (window.confirm('Remove all demo-seeded leads, opportunities, and proposals?')) {
              clearMutation.mutate()
            }
          }}
        >
          {clearMutation.isPending ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="size-4 mr-2" />
          )}
          Clear Demo Data
        </Button>
      </CardContent>
    </Card>
  )
}

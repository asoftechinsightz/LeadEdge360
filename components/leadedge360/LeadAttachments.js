'use client'

import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Button } from '@/components/design-system/core/Button'
import { EmptyState } from '@/components/design-system/core/EmptyState'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { apiGet, apiDelete, api } from '@/src/lib/api'
import { getAccessToken } from '@/src/lib/auth-storage'
import { toast } from 'sonner'
import { Download, Paperclip, Trash2, Upload } from 'lucide-react'

const MAX_BYTES = 5 * 1024 * 1024

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function LeadAttachments({ leadId, onChanged }) {
  const inputRef = useRef(null)
  const queryClient = useQueryClient()
  const [downloadingId, setDownloadingId] = useState('')

  const attachmentsQuery = useQuery({
    queryKey: ['lead', leadId, 'attachments'],
    queryFn: async () => {
      const data = await apiGet(`/leads/${leadId}/attachments`)
      return data?.items || []
    },
    enabled: !!leadId,
  })

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post(`/leads/${leadId}/attachments`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('File uploaded')
      attachmentsQuery.refetch()
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] })
      onChanged?.()
    },
    onError: (err) => toast.error(err.message || 'Upload failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (attachmentId) => apiDelete(`/leads/${leadId}/attachments/${attachmentId}`),
    onSuccess: () => {
      toast.success('Attachment removed')
      attachmentsQuery.refetch()
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] })
      onChanged?.()
    },
    onError: (err) => toast.error(err.message || 'Delete failed'),
  })

  const handleFilePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_BYTES) {
      toast.error('File too large (max 5 MB)')
      e.target.value = ''
      return
    }
    uploadMutation.mutate(file)
    e.target.value = ''
  }

  const handleDownload = async (attachment) => {
    setDownloadingId(attachment.id)
    try {
      const token = getAccessToken()
      const res = await fetch(`/api/leads/${leadId}/attachments/${attachment.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = attachment.fileName || 'attachment'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(err.message || 'Download failed')
    } finally {
      setDownloadingId('')
    }
  }

  const handleDelete = (attachment) => {
    if (!window.confirm(`Delete ${attachment.fileName}?`)) return
    deleteMutation.mutate(attachment.id)
  }

  if (attachmentsQuery.isLoading) {
    return <LoadingState label="Loading files…" className="py-6" />
  }

  const items = attachmentsQuery.data || []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFilePick}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={uploadMutation.isPending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-1" />
          {uploadMutation.isPending ? 'Uploading…' : 'Upload file'}
        </Button>
        <span className="text-xs text-muted-foreground">Max 5 MB</span>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No files attached yet" className="py-6" />
      ) : (
        <div className="space-y-2">
          {items.map((file) => (
            <Card key={file.id} className="bg-card/60">
              <CardContent className="p-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {[file.mimeType, formatSize(file.size)].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={downloadingId === file.id}
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(file)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

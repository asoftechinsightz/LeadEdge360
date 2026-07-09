'use client'

import { useState } from 'react'
import { api } from '@/src/lib/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Download, Eye, Printer, MessageCircle } from 'lucide-react'

export function PdfDocumentActions({
  pdfUrl,
  filename = 'document.pdf',
  shareTitle = 'Document',
  shareDetails = '',
  size = 'sm',
  variant = 'outline',
}) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const fetchBlob = async () => {
    const res = await api.get(pdfUrl, { responseType: 'blob' })
    return res.data
  }

  const downloadPdf = async () => {
    try {
      const blob = await fetchBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(err.message || 'PDF download failed')
    }
  }

  const previewPdf = async () => {
    try {
      const blob = await fetchBlob()
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      setPreviewOpen(true)
    } catch (err) {
      toast.error(err.message || 'Preview failed')
    }
  }

  const printPdf = async () => {
    try {
      const blob = await fetchBlob()
      const url = URL.createObjectURL(blob)
      const w = window.open(url)
      if (w) w.onload = () => w.print()
    } catch (err) {
      toast.error(err.message || 'Print failed')
    }
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${shareTitle}${shareDetails ? `\n${shareDetails}` : ''}\nDownload from your LeadEdge360 account.`)
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  const closePreview = (open) => {
    setPreviewOpen(open)
    if (!open && previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1">
        <Button type="button" size={size} variant="ghost" onClick={previewPdf} title="Preview">
          <Eye className="size-4" />
        </Button>
        <Button type="button" size={size} variant="ghost" onClick={downloadPdf} title="Download PDF">
          <Download className="size-4" />
        </Button>
        <Button type="button" size={size} variant={variant} onClick={printPdf} title="Print">
          <Printer className="size-4" />
        </Button>
        <Button type="button" size={size} variant={variant} onClick={shareWhatsApp} title="Share via WhatsApp">
          <MessageCircle className="size-4" />
        </Button>
      </div>

      <Dialog open={previewOpen} onOpenChange={closePreview}>
        <DialogContent className="max-w-4xl h-[85vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{shareTitle} — Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <iframe src={previewUrl} title="PDF preview" className="w-full flex-1 min-h-[70vh] border-0" />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

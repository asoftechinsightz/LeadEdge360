'use client'

import Link from 'next/link'
import { MessageCircle, Calendar } from 'lucide-react'
import { WHATSAPP_NUMBER, CALENDLY_URL } from '@/lib/marketing-content'
import { isMarketingPath } from '@/lib/marketing-routes'
import { usePathname } from 'next/navigation'

export default function MarketingWidgets() {
  const pathname = usePathname()
  if (!isMarketingPath(pathname)) return null

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi AsoftechInsightz — I would like to book a product demo.')}`

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3" aria-label="Quick actions">
      <a
        href={CALENDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center size-12 rounded-full bg-[#0066FF] text-white shadow-lg shadow-blue-500/30 hover:bg-[#00C6FF] transition-colors"
        aria-label="Schedule demo on Calendly"
      >
        <Calendar className="size-5" />
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center size-12 rounded-full bg-[#25D366] text-white shadow-lg shadow-green-500/30 hover:brightness-110 transition"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="size-5" />
      </a>
      <Link
        href="/book-demo"
        className="hidden sm:flex items-center gap-2 rounded-full bg-white backdrop-blur-md border border-border px-4 py-2 text-sm text-white hover:bg-white/15 transition"
      >
        Book Demo
      </Link>
    </div>
  )
}

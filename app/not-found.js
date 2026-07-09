import Link from 'next/link'
import SiteShell from '@/components/site/SiteShell'
import { Button } from '@/components/ui/button'
import { ArrowRight, Home } from 'lucide-react'

export const metadata = {
  title: 'Page not found',
  description: 'The page you requested could not be found on AsoftechInsightz.',
  robots: { index: false, follow: false },
}

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products/leadedge360', label: 'LeadEdge360' },
  { href: '/products/retailedge360', label: 'RetailEdge360' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/book-demo', label: 'Book Demo' },
  { href: '/contact', label: 'Contact' },
]

export default function NotFound() {
  return (
    <SiteShell>
      <section className="container py-24 lg:py-32 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <p className="text-6xl font-display font-bold gradient-text">404</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold mt-4">This page could not be found</h1>
        <p className="text-muted-foreground mt-3 max-w-md">
          The URL may be outdated or the page has moved. Try one of these destinations or return home.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          <Button asChild className="rounded-full bg-[#0066FF] hover:bg-[#00C6FF]">
            <Link href="/">
              <Home className="mr-2 size-4" />
              Back to home
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full border-border">
            <Link href="/book-demo">
              Book a demo
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-12 max-w-2xl">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm px-4 py-2 rounded-full border border-border bg-white hover:shadow-md transition-shadow"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  )
}

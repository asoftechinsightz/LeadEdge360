import Link from 'next/link'
import { BrandWordmark } from '@/components/brand/BrandWordmark'
import { COMPANY, COMPANY_LEGAL } from '@/lib/marketing-content'
import { Shield, Award, MapPin } from 'lucide-react'

const FOOTER_LINKS = {
  Products: [
    { href: '/products/leadedge360', label: 'LeadEdge360' },
    { href: '/products/retailedge360', label: 'RetailEdge360' },
    { href: '/products/trinetra360', label: 'Trinetra360' },
    { href: '/book-demo', label: 'Book Consultation' },
    { href: '/pricing', label: 'Pricing' },
  ],
  Industries: [
    { href: '/industries', label: 'All Industries' },
    { href: '/solutions', label: 'Solutions' },
  ],
  Resources: [
    { href: '/blog', label: 'Knowledge Center' },
    { href: '/resources', label: 'Resources' },
    { href: '/growth-audit', label: 'Growth Assessment' },
    { href: '/download', label: 'Downloads' },
  ],
  Company: [
    { href: '/about', label: 'About' },
    { href: '/customers', label: 'Customers' },
    { href: '/partners', label: 'Partners' },
    { href: '/contact', label: 'Contact' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms & Conditions' },
    { href: '/refund-policy', label: 'Refund Policy' },
    { href: '/cancellation-policy', label: 'Cancellation' },
    { href: '/cookie-policy', label: 'Cookie Policy' },
    { href: '/shipping-delivery', label: 'Digital Delivery' },
    { href: '/acceptable-use', label: 'Acceptable Use' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-0">
      <div className="container py-16">
        <div className="grid lg:grid-cols-6 gap-10">
          <div className="lg:col-span-2">
            <BrandWordmark href="/" size="lg" className="mb-4" />
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">{COMPANY.tagline}</p>
            <p className="text-xs text-muted-foreground mt-3 max-w-sm">{COMPANY_LEGAL.legalName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <a href={`mailto:${COMPANY.email}`} className="hover:text-primary">{COMPANY.email}</a>
              {' · '}
              <a href={`tel:${COMPANY.phoneTel}`} className="hover:text-primary">{COMPANY.phone}</a>
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-muted-foreground">
                <Shield className="size-3.5 text-[hsl(var(--brand-electric))]" /> DPDP Ready
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-muted-foreground">
                <Award className="size-3.5 text-[hsl(var(--brand-electric))]" /> Enterprise Grade
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-muted-foreground">
                <MapPin className="size-3.5 text-[hsl(var(--brand-electric))]" /> Made in India
              </span>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-foreground text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5 text-sm">
                {links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-muted-foreground hover:text-[hsl(var(--brand-electric))] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-secondary/40">
        <div className="container py-6 text-sm text-muted-foreground flex flex-wrap justify-between gap-2">
          <div>© {new Date().getFullYear()} AsoftechInsightz · AI-Powered Business Growth Platform</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a href={`mailto:${COMPANY.email}`} className="hover:text-[hsl(var(--brand-electric))]">{COMPANY.email}</a>
            <a href={`tel:${COMPANY.phoneTel}`} className="hover:text-[hsl(var(--brand-electric))]">{COMPANY.phone}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

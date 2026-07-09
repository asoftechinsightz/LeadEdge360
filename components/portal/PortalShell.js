'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { clearPortalSession, getPortalCustomer } from '@/lib/portal/client'

const NAV = [
  { href: '/portal/invoices', label: 'Invoices' },
  { href: '/portal/profile', label: 'Profile' },
]

export function PortalShell({ children }) {
  const pathname = usePathname()
  const customer = getPortalCustomer()

  const logout = () => {
    clearPortalSession()
    window.location.assign('/portal/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/40">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <BrandLogo href="/portal/invoices" variant="compact" />
          <nav className="flex items-center gap-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm px-3 py-1.5 rounded-md ${
                  pathname === item.href ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Button variant="outline" size="sm" onClick={logout}>
              Sign out
            </Button>
          </nav>
        </div>
        {customer ? (
          <p className="mx-auto max-w-5xl px-4 pb-3 text-xs text-muted-foreground">
            Signed in as {customer.name || customer.email}
          </p>
        ) : null}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { BREADCRUMB_LABELS } from '@/components/layout/app-nav'
import {
  CreditCard,
  ExternalLink,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Search,
  Target,
} from 'lucide-react'

function buildBreadcrumbs(pathname) {
  if (!pathname || pathname === '/dashboard') {
    return [{ label: 'Dashboard', href: '/dashboard', current: true }]
  }

  const segments = pathname.split('/').filter(Boolean)
  const crumbs = []
  let path = ''

  segments.forEach((segment, index) => {
    path += `/${segment}`
    const label =
      BREADCRUMB_LABELS[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

    crumbs.push({
      label,
      href: path,
      current: index === segments.length - 1,
    })
  })

  return crumbs
}

export default function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const crumbs = useMemo(() => buildBreadcrumbs(pathname), [pathname])

  const [user, setUser] = useState(null)
  const [billing, setBilling] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((j) => {
        setUser(j.user || null)
        setBilling(j.billing || null)
      })
      .catch(() => {
        setUser(null)
        setBilling(null)
      })
  }, [pathname])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const r = await fetch(`/api/leads?q=${encodeURIComponent(query.trim())}&pageSize=8`)
        const j = await r.json()
        setResults(j.leads || [])
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }, [])

  const goToLead = () => {
    setSearchOpen(false)
    setQuery('')
    router.push('/leadedge360')
  }

  const planLabel = billing?.plan
    ? billing.plan.charAt(0).toUpperCase() + billing.plan.slice(1)
    : null

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="-ml-1 lg:hidden" />
      <Separator orientation="vertical" className="mr-1 h-6 lg:hidden" />

      <Breadcrumb className="hidden min-w-0 flex-1 lg:flex">
        <BreadcrumbList>
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="contents">
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {crumb.current ? (
                  <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-1 items-center justify-end gap-2 lg:max-w-md lg:flex-none lg:flex-1 lg:justify-center">
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  if (!searchOpen) setSearchOpen(true)
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search leads…"
                className="h-9 w-full rounded-full border-border/60 bg-muted/40 pl-9 pr-3 text-sm"
                aria-label="Global search"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="end">
            <ScrollArea className="max-h-72">
              {query.trim().length < 2 ? (
                <p className="p-3 text-xs text-muted-foreground">Type at least 2 characters to search leads.</p>
              ) : searching ? (
                <p className="p-3 text-xs text-muted-foreground">Searching…</p>
              ) : results.length === 0 ? (
                <p className="p-3 text-xs text-muted-foreground">No leads found.</p>
              ) : (
                <ul className="p-1">
                  {results.map((lead) => (
                    <li key={lead.id}>
                      <button
                        type="button"
                        onClick={goToLead}
                        className="flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left text-sm hover:bg-muted/60"
                      >
                        <span className="font-medium">{lead.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {lead.company || lead.phone} · {lead.territory}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
            {results.length > 0 && (
              <div className="border-t border-border/60 p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setSearchOpen(false)
                    router.push('/leadedge360')
                  }}
                >
                  Open CRM inbox
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            {planLabel && billing?.activated && (
              <Badge
                variant="outline"
                className="hidden rounded-full border-primary/30 text-primary sm:inline-flex capitalize"
              >
                {planLabel}
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 py-1 pl-1 pr-3 transition hover:border-primary/40"
                >
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="size-7 rounded-full object-cover" />
                  ) : (
                    <div className="grid size-7 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden max-w-[120px] truncate text-sm sm:inline">
                    {user.name || user.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="font-medium">{user.name || 'User'}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 size-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/leadedge360" className="cursor-pointer">
                    <Target className="mr-2 size-4" />
                    LeadEdge360
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/retailedge360" className="cursor-pointer">
                    <IndianRupee className="mr-2 size-4" />
                    RetailEdge360
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing" className="cursor-pointer">
                    <CreditCard className="mr-2 size-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/pricing" className="cursor-pointer">
                    <ExternalLink className="mr-2 size-4" />
                    Upgrade plan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-rose-300">
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href="/signin">Sign in</Link>
          </Button>
        )}
      </div>
    </header>
  )
}

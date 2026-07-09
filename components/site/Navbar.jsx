'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Menu, X, LogOut, ChevronDown } from 'lucide-react'
import { isSuitePath } from '@/components/suite/nav-config'
import { isMarketingPath } from '@/lib/marketing-routes'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { BRAND_LOGOS, PRODUCTS } from '@/lib/brand'

const nav = [
  { href: '/solutions', label: 'Solutions' },
  { href: '/industries', label: 'Industries' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'Company' },
]

const PRODUCT_LINKS = [
  { ...PRODUCTS.leadedge360, href: '/products/leadedge360' },
  { ...PRODUCTS.retailedge360, href: '/products/retailedge360' },
  { ...PRODUCTS.trinetra360, href: '/products/trinetra360' },
]

export default function Navbar() {
  const pathname = usePathname()
  const isBusinessSuite = isSuitePath(pathname)
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser')
      setUser(stored ? JSON.parse(stored) : null)
    } catch {
      setUser(null)
    }
    setLoading(false)
  }, [pathname])

  const logout = async () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    window.location.href = '/signin'
  }

  if (isBusinessSuite) return null

  const isEnterpriseNav = isMarketingPath(pathname)

  return (
    <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl ${
      isEnterpriseNav
        ? 'border-white/10 bg-[#030712]/80 text-white shadow-lg shadow-black/20'
        : 'border-border/40 bg-background/70'
    }`}>
      <div className="container flex h-16 items-center justify-between">
        <BrandLogo href="/" variant="compact" />

        <nav className="hidden lg:flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger className={`flex items-center gap-1 text-sm transition-colors hover:text-primary outline-none ${isEnterpriseNav ? 'text-slate-300 hover:text-cyan-300' : 'text-muted-foreground'}`}>
              Products <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel>AI SaaS Platforms</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PRODUCT_LINKS.map((product) => (
                <DropdownMenuItem key={product.id} asChild>
                  <Link href={product.href} className="cursor-pointer flex items-center gap-3 py-2">
                    {product.logo ? (
                      <Image src={product.logo} alt="" width={100} height={32} className="h-8 w-auto object-contain" />
                    ) : (
                      <span className="text-sm font-semibold text-foreground">{product.name}</span>
                    )}
                    <span className="text-xs text-muted-foreground">{product.tagline}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {nav.map(item => (
            <Link key={item.href} href={item.href}
              className={`text-sm transition-colors hover:text-primary ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? (isEnterpriseNav ? 'text-cyan-300' : 'text-primary') : (isEnterpriseNav ? 'text-slate-300 hover:text-cyan-300' : 'text-muted-foreground')}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full bg-card/60 border border-border/60 pl-1 pr-3 py-1 hover:border-primary/40 transition">
                  <div className="h-7 w-7 rounded-full bg-primary/20 grid place-items-center text-primary text-xs font-semibold">{(user.name || user.email).charAt(0).toUpperCase()}</div>
                  <span className="text-sm max-w-[120px] truncate">{user.name || user.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href={PRODUCTS.leadedge360.href} className="cursor-pointer">Open suite</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-rose-300"><LogOut className="h-4 w-4 mr-2"/>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" className={`rounded-full px-5 ${isEnterpriseNav ? 'text-slate-200 hover:text-white hover:bg-white/10' : ''}`}>
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button asChild variant="outline" className={`rounded-full px-5 ${isEnterpriseNav ? 'border-white/20 bg-white/5 text-white hover:bg-white/10' : ''}`}>
                <Link href="/book-demo">Book a Demo</Link>
              </Button>
              <Button asChild className="rounded-full px-5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-violet-500/25">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </>
          )}
        </div>

        <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className={`lg:hidden border-t ${isEnterpriseNav ? 'border-white/10 bg-[#030712]/95' : 'border-border/40 bg-background/95'}`}>
          <div className="container py-4 flex flex-col gap-3">
            <p className={`text-xs uppercase tracking-wide ${isEnterpriseNav ? 'text-slate-500' : 'text-muted-foreground'}`}>Products</p>
            {PRODUCT_LINKS.map((p) => (
              <Link key={p.id} href={p.href} onClick={() => setOpen(false)} className="block">
                {p.logo ? (
                  <Image src={p.logo} alt={p.name} width={120} height={36} className="h-9 w-auto object-contain" />
                ) : (
                  <span className="text-sm font-semibold">{p.name}</span>
                )}
              </Link>
            ))}
            {nav.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-primary py-1">{item.label}</Link>
            ))}
            <Button asChild variant="outline" className={`rounded-full mt-2 ${isEnterpriseNav ? 'border-white/20 text-white' : ''}`}>
              <Link href="/book-demo">Book a Demo</Link>
            </Button>
            <Button asChild className="rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

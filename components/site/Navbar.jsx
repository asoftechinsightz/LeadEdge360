'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react'

const LOGO = 'https://customer-assets.emergentagent.com/job_qualify-leads-hub/artifacts/5r2ee7t5_image.png'

const nav = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/blog', label: 'Blog' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((j) => {
        setUser(j.user || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [pathname])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-xl bg-background/70">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-11 w-11 rounded-full overflow-hidden ring-2 ring-primary/40 shadow-lg bg-[#0B1220]">
            <Image src={LOGO} alt="AsoftechInsightz" fill className="object-cover scale-[1.4]" sizes="44px" priority />
          </div>
          <div className="leading-tight">
            <div className="font-display font-semibold text-base text-foreground">
              <span className="text-white">Asoftech</span><span className="text-primary">Insightz</span>
            </div>
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground">INSIGHT · INNOVATION · INTELLIGENCE</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors hover:text-primary ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <Button asChild className="rounded-full px-5 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Workspace
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full bg-card/60 border border-border/60 pl-1 pr-3 py-1 hover:border-primary/40 transition">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-primary/20 grid place-items-center text-primary text-xs font-semibold">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm max-w-[120px] truncate">{user.name || user.email}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Go to dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-rose-300">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="rounded-full px-5">
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button asChild className="rounded-full px-5 bg-primary hover:bg-primary/90 text-primary-foreground glow-orange">
                <Link href="/signin">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border/40 bg-background/95">
          <div className="container py-4 flex flex-col gap-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-primary py-1"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Button asChild className="rounded-full mt-2 bg-primary">
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Workspace
                  </Link>
                </Button>
                <Button onClick={logout} variant="outline" className="rounded-full">
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign out ({user.email})
                </Button>
              </>
            ) : (
              <Button asChild className="rounded-full mt-2 bg-primary">
                <Link href="/signin" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

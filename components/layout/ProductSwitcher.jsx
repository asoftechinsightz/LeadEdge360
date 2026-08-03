'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ChevronsUpDown, Check, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRODUCTS } from '@/components/layout/app-nav'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const LOGO =
  'https://customer-assets.emergentagent.com/job_qualify-leads-hub/artifacts/5r2ee7t5_image.png'

function activeProduct(pathname) {
  if (pathname?.startsWith('/retailedge360')) return PRODUCTS[1]
  if (pathname?.startsWith('/leadedge360')) return PRODUCTS[0]
  return PRODUCTS[0]
}

export default function ProductSwitcher({ collapsed = false }) {
  const pathname = usePathname()
  const current = activeProduct(pathname)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden ring-1 ring-sidebar-border">
                <Image
                  src={LOGO}
                  alt="AsoftechInsightz"
                  width={32}
                  height={32}
                  className="object-cover scale-[1.35]"
                />
              </div>
              {!collapsed && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-display font-semibold">
                    <span className="text-sidebar-foreground">Asoftech</span>
                    <span className="text-sidebar-primary">Insightz</span>
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/60">{current.shortName}</span>
                </div>
              )}
              {!collapsed && <ChevronsUpDown className="ml-auto size-4 opacity-60" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-lg"
            align="start"
            side={collapsed ? 'right' : 'bottom'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">Products</DropdownMenuLabel>
            {PRODUCTS.map((product) => {
              const Icon = product.icon
              const isActive = product.id === current.id
              return (
                <DropdownMenuItem key={product.id} asChild>
                  <Link
                    href={product.href}
                    className={cn('gap-2 p-2 cursor-pointer', isActive && 'bg-muted/50')}
                  >
                    <div
                      className={cn(
                        'flex size-6 items-center justify-center rounded-md border',
                        product.accent === 'primary'
                          ? 'border-primary/40 bg-primary/15 text-primary'
                          : 'border-accent/40 bg-accent/15 text-accent'
                      )}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-xs text-muted-foreground">{product.description}</span>
                    </div>
                    {isActive && (
                      <Check
                        className={cn(
                          'ml-auto size-4',
                          product.accent === 'primary' ? 'text-primary' : 'text-accent'
                        )}
                      />
                    )}
                  </Link>
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/products"
                className="cursor-pointer text-xs text-muted-foreground gap-2"
              >
                <ExternalLink className="size-3.5" />
                Marketing site
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export { activeProduct }

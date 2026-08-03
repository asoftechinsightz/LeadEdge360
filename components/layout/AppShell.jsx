'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { WORKSPACE_NAV } from '@/components/layout/app-nav'
import ProductSwitcher from '@/components/layout/ProductSwitcher'
import DashboardHeader from '@/components/layout/DashboardHeader'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'

function NavItems() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <>
      {WORKSPACE_NAV.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
            {group.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname?.startsWith(`${item.href}/`)
                const accent = item.accent || 'primary'

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        isActive &&
                          'bg-sidebar-accent text-sidebar-accent-foreground rounded-l-none border-l-2',
                        isActive && accent === 'accent' && 'border-accent',
                        isActive && accent !== 'accent' && 'border-sidebar-primary'
                      )}
                    >
                      <Link href={item.href}>
                        <Icon
                          className={cn(
                            isActive && accent === 'accent' && 'text-accent',
                            isActive && accent !== 'accent' && 'text-sidebar-primary'
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
      {collapsed && <span className="sr-only">Navigation</span>}
    </>
  )
}

function AppSidebar() {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="border-b border-sidebar-border/60">
        <ProductSwitcher collapsed={collapsed} />
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        <NavItems />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-2">
        <p className="px-2 text-[10px] leading-relaxed text-sidebar-foreground/45 group-data-[collapsible=icon]:hidden">
          Workspace · DPDP ready
        </p>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

/**
 * Enterprise app chrome: collapsible sidebar, product switcher,
 * global search, breadcrumbs, and user menu. Marketing pages use SiteShell.
 */
export default function AppShell({ children }) {
  return (
    <div className="min-h-svh bg-background">
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset className="min-h-svh flex flex-col bg-background">
          <DashboardHeader />
          <div className="flex-1 overflow-auto">
            <div className="mx-auto min-h-full w-full max-w-[1600px] p-4 md:p-6">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

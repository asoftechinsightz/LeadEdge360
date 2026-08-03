'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ENTERPRISE_NAV,
  isNavGroupActive,
  isNavItemActive,
} from '@/components/layout/enterprise-nav'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'

function NavLink({ item }) {
  const pathname = usePathname()
  const active = isNavItemActive(pathname, item.href, item.exact)
  const Icon = item.icon

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={active}>
        <Link href={item.href}>
          <Icon className={cn('size-4', active && 'text-sidebar-primary')} />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

function NavGroup({ group }) {
  const pathname = usePathname()
  const groupActive = isNavGroupActive(pathname, group)
  const Icon = group.icon

  return (
    <Collapsible defaultOpen={groupActive} className="group/collapsible">
      <SidebarGroup className="py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={group.label}
                isActive={groupActive}
                className={cn(
                  groupActive &&
                    'border-l-2 border-sidebar-primary rounded-l-none bg-sidebar-accent text-sidebar-accent-foreground'
                )}
              >
                <Icon className={cn(groupActive && 'text-sidebar-primary')} />
                <span>{group.label}</span>
                <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {group.items.map((item) => (
                  <NavLink key={`${group.id}-${item.label}`} item={item} />
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </Collapsible>
  )
}

function DashboardLink({ item }) {
  const pathname = usePathname()
  const active = isNavItemActive(pathname, item.href, item.exact)
  const Icon = item.icon

  return (
    <SidebarGroup className="py-0">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={active}
              tooltip={item.label}
              className={cn(
                active &&
                  'border-l-2 border-sidebar-primary rounded-l-none bg-sidebar-accent text-sidebar-accent-foreground'
              )}
            >
              <Link href={item.href}>
                <Icon className={cn(active && 'text-sidebar-primary')} />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

/**
 * Enterprise sidebar navigation — grouped hubs with nested items.
 * Drop into AppShell SidebarContent: `<EnterpriseNavigation />`
 */
export default function EnterpriseNavigation() {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  const [dashboard, ...groups] = ENTERPRISE_NAV

  return (
    <nav aria-label="Enterprise navigation" className="flex flex-col gap-0.5">
      <DashboardLink item={dashboard} />

      {groups.map((group) => (
        <NavGroup key={group.id} group={group} />
      ))}

      {collapsed && <span className="sr-only">Enterprise navigation</span>}
    </nav>
  )
}

export { ENTERPRISE_NAV }

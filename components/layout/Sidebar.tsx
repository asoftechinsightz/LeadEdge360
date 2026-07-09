'use client'

import {
  LayoutDashboard,
  Target,
  BriefcaseBusiness,
  Bot,
  Sparkles,
  Workflow,
  MapPin,
  Map,
  Rocket,
  BarChart3,
  MessageSquare,
  FileBarChart,
  Megaphone,
  TrendingUp,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  LifeBuoy,
  FileText,
  Receipt,
  Activity,
  Server,
  GitBranchPlus,
  Plug,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/design-system/core/Button'
import { Badge } from '@/components/design-system/core/Badge'
import { SuiteBrandLogo } from '@/components/brand/SuiteBrandLogo'
import { useOrgFeatures } from '@/hooks/useFeatureFlag'
import { UPGRADE_URL } from '@/lib/subscription/gate'
import GetStartedChecklist from '@/components/onboarding/GetStartedChecklist'

export type LeadEdgeNavItem = {
  href: string
  label: string
  icon: LucideIcon
  feature?: string
  badge?: 'new'
}

export type LeadEdgeNavGroup = {
  label: string
  items: LeadEdgeNavItem[]
}

/** Unified LeadEdge360 sidebar — matches enterprise module reference. */
export const LEADEDGE360_NAV: LeadEdgeNavGroup[] = [
  {
    label: 'Dashboard',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Sales',
    items: [
      { href: '/leadedge360/leads', label: 'Leads', icon: Target },
      { href: '/leadedge360/opportunities', label: 'Opportunities', icon: BriefcaseBusiness },
    ],
  },
  {
    label: 'CRM',
    items: [
      { href: '/proposals', label: 'Proposals', icon: FileText },
      { href: '/invoices', label: 'Invoices', icon: Receipt },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/leadedge360/automation', label: 'Automation Hub', icon: Workflow, feature: 'campaigns', badge: 'new' },
      { href: '/campaigns', label: 'Campaigns', icon: Megaphone, feature: 'campaigns' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { href: '/analytics', label: 'Analytics', icon: Activity, feature: 'advanced_analytics' },
      { href: '/revenue', label: 'Revenue', icon: TrendingUp, feature: 'revenue_dashboard' },
    ],
  },
  {
    label: 'AI Workspace',
    items: [
      { href: '/leadedge360/command-center', label: 'AI Command Center', icon: Bot, feature: 'ai_assistant', badge: 'new' },
      { href: '/leadedge360/insights', label: 'AI Insights', icon: Sparkles, feature: 'ai_assistant', badge: 'new' },
      { href: '/leadedge360/geo-finder', label: 'Geo Lead Finder', icon: MapPin, badge: 'new' },
      { href: '/leadedge360/territories', label: 'Territory Management', icon: Map, badge: 'new' },
      { href: '/leadedge360/growth-engine', label: 'Growth Audit', icon: Rocket, badge: 'new' },
      { href: '/leadedge360/revenue-intelligence', label: 'Revenue Intel', icon: TrendingUp, feature: 'revenue_dashboard' },
      { href: '/leadedge360/conversations', label: 'Conversations', icon: MessageSquare, feature: 'whatsapp_pro', badge: 'new' },
      { href: '/leadedge360/reports', label: 'Reports', icon: FileBarChart, feature: 'advanced_analytics' },
    ],
  },
  {
    label: 'Platform Ops',
    items: [
      { href: '/ops/agents', label: 'Agent Runtime', icon: Bot, badge: 'new' },
      { href: '/ops/ai-analytics', label: 'AI Analytics', icon: BarChart3, badge: 'new' },
      { href: '/ops/events', label: 'Event Operations', icon: Server, badge: 'new' },
      { href: '/ops/ai', label: 'AI Operations', icon: Bot, badge: 'new' },
      { href: '/ops/ai-timeline', label: 'AI Agent Timeline', icon: Activity, badge: 'new' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
      { href: '/administration/integrations', label: 'Integrations', icon: Plug, feature: 'api_access' },
      { href: '/payments', label: 'Payments', icon: GitBranchPlus },
    ],
  },
]

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
  className?: string
}

function itemLocked(feature: string | undefined, features: string[]) {
  if (!feature) return false
  return !features.includes(feature)
}

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  if (href === '/leadedge360') return pathname === '/leadedge360'
  return pathname === href || pathname?.startsWith(`${href}/`)
}

export function Sidebar({ collapsed, onToggle, className }: SidebarProps) {
  const pathname = usePathname()
  const featuresQuery = useOrgFeatures()
  const features: string[] = featuresQuery.data?.data?.features || []

  return (
    <aside
      className={cn(
        'hidden shrink-0 border-r border-border/80 bg-card/40 lg:flex lg:flex-col',
        collapsed ? 'w-[4.5rem]' : 'w-[240px]',
        className,
      )}
      aria-label="LeadEdge360 navigation"
    >
      <div
        className={cn(
          'flex min-h-16 items-center border-b border-border/50 px-1.5 py-1.5 overflow-hidden',
          collapsed ? 'justify-center' : 'justify-between gap-2',
        )}
      >
        <SuiteBrandLogo collapsed={collapsed} className="shrink-0 px-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="shrink-0"
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>
      </div>

      <GetStartedChecklist collapsed={collapsed} />

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-1 py-2">
        {LEADEDGE360_NAV.map((group) => (
          <div key={group.label} className="mb-2">
            {!collapsed && (
              <p className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                {group.label}
              </p>
            )}
            <div className="space-y-px">
              {group.items.map((item) => {
                const active = isActivePath(pathname || '', item.href)
                const locked = itemLocked(item.feature, features)
                const Icon = item.icon

                const linkClassName = cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-all',
                  active
                    ? 'bg-primary/15 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  locked && 'opacity-80',
                  collapsed && 'justify-center px-1.5',
                )

                const inner = (
                  <>
                    <Icon className="size-3.5 shrink-0" aria-hidden />
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge === 'new' && !locked && (
                          <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5 border-violet-500/30 text-violet-400">
                            new
                          </Badge>
                        )}
                        {locked && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-500 shrink-0">
                            <Lock className="size-2.5" />
                            Upgrade
                          </span>
                        )}
                      </>
                    )}
                  </>
                )

                if (locked) {
                  return (
                    <Link
                      key={item.href}
                      href={`${UPGRADE_URL}?feature=${encodeURIComponent(item.feature || '')}`}
                      title={`${item.label} — Upgrade to unlock`}
                      className={linkClassName}
                    >
                      {inner}
                    </Link>
                  )
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    data-tour={item.href === '/leadedge360/leads' ? 'leads-tab' : undefined}
                    className={linkClassName}
                  >
                    {inner}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

export function isLeadEdge360Path(pathname: string) {
  if (!pathname) return false
  if (pathname === '/leadedge360' || pathname.startsWith('/leadedge360/')) return true
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) return true
  if (pathname === '/administration' || pathname.startsWith('/administration/')) return true
  return LEADEDGE360_NAV.some((group) =>
    group.items.some((item) =>
      item.href !== '/dashboard' && (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    ),
  )
}

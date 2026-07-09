'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/design-system/core/Button';
import { Badge } from '@/components/design-system/core/Badge';
import { getNavGroupsForPath, filterNavGroupsByFeatures } from './nav-config';
import { useOrgFeatures, useMockApiMode } from '@/hooks/useFeatureFlag';
import { filterNavGroupsByRole } from '@/lib/nav/permissions';
import { useSuiteAuth } from '@/components/suite/SuiteAuthContext';
import { SuiteBrandLogo } from '@/components/brand/SuiteBrandLogo';

const SIDEBAR_WIDTH = 'w-[240px]';

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
};

const HIGHLIGHT_GROUPS = new Set(['AI Workspace']);

export function Sidebar({ collapsed, onToggle, className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useSuiteAuth();
  const featuresQuery = useOrgFeatures();
  const mockMode = useMockApiMode();
  const features: string[] = featuresQuery.data?.data?.features || [];
  const role = (user as { role?: string })?.role;
  const navGroups = filterNavGroupsByRole(
    filterNavGroupsByFeatures(getNavGroupsForPath(pathname || ''), features),
    role,
  );

  return (
    <aside
      className={cn(
        'hidden shrink-0 border-r border-border/80 bg-card/40 lg:flex lg:flex-col',
        collapsed ? 'w-[4.5rem]' : SIDEBAR_WIDTH,
        className
      )}
      aria-label="Suite navigation"
    >
      <div
        className={cn(
          'flex min-h-16 items-center border-b border-border/50 px-1.5 py-1.5 overflow-hidden',
          collapsed ? 'justify-center' : 'justify-between gap-2'
        )}
      >
        {!collapsed ? (
          <SuiteBrandLogo collapsed={false} className="shrink-0 px-1" />
        ) : (
          <SuiteBrandLogo collapsed className="shrink-0 px-1" />
        )}
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

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-0.5 py-1">
        {navGroups.map((group) => {
          const isHighlight = HIGHLIGHT_GROUPS.has(group.label);
          return (
            <div
              key={group.label}
              className={cn('mb-0.5 rounded', isHighlight && 'bg-violet-500/[0.05] px-0.5')}
            >
              {!collapsed && (
                <div className="flex items-center gap-1 px-1 py-0.5">
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground/80 truncate flex-1">
                    {group.label}
                  </p>
                  {isHighlight && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[7px] px-1 py-0 h-3.5 shrink-0',
                        mockMode.isMock
                          ? 'border-amber-500/40 text-amber-400'
                          : 'border-emerald-500/40 text-emerald-400',
                      )}
                    >
                      {mockMode.label}
                    </Badge>
                  )}
                </div>
              )}
              <div className="space-y-px">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname?.startsWith(`${item.href}/`));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={`${group.label}-${item.label}-${item.href}`}
                      href={item.href}
                      title={item.label}
                      data-tour={item.href === '/leadedge360/leads' ? 'leads-tab' : undefined}
                      className={cn(
                        'flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] transition-all',
                        active
                          ? 'bg-primary/15 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                        collapsed && 'justify-center px-1'
                      )}
                    >
                      <Icon className="size-3 shrink-0" aria-hidden />
                      {!collapsed && (
                        <>
                          <span className="truncate flex-1">{item.label}</span>
                          {'badge' in item && item.badge === 'new' && (
                            <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5 border-violet-500/30 text-violet-400">
                              new
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

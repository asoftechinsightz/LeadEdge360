'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from './Breadcrumbs';
import { MobileNav } from './MobileNav';
import { Sidebar as SuiteSidebar } from './Sidebar';
import { Sidebar as LeadEdgeSidebar, isLeadEdge360Path } from '@/components/layout/Sidebar';
import { SuiteHeader } from './SuiteHeader';
import LeadOnboardingBanner from '@/components/onboarding/LeadOnboardingBanner';

export type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const pathname = usePathname() || '';
  const leadEdgeNav = isLeadEdge360Path(pathname);
  const NavSidebar = leadEdgeNav ? LeadEdgeSidebar : SuiteSidebar;

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <NavSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />

      <div className="flex min-w-0 w-full flex-1 flex-col">
        <SuiteHeader onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 w-full min-w-0 overflow-x-hidden">
          <div className="w-full px-4 py-6 md:px-6 lg:px-8">
            <Breadcrumbs className="mb-4" />
            <LeadOnboardingBanner />
            <div className="w-full min-w-0">{children}</div>
          </div>
        </main>
      </div>

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </div>
  );
}

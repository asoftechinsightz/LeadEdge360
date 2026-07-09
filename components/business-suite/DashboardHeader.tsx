'use client';

import * as React from 'react';
import { SuiteHeader } from '@/components/suite/SuiteHeader';
import { MobileNav } from '@/components/suite/MobileNav';

/**
 * @deprecated Use `@/components/suite/AppShell` via `SuiteRouteLayout` — legacy shim.
 */
export default function DashboardHeader() {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <>
      <SuiteHeader onOpenMobileNav={() => setMobileNavOpen(true)} />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}

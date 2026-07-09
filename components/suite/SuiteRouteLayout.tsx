'use client';

/**
 * Auth guard is applied here via SuiteAuthProvider.
 * All sign-in redirects use root-absolute `/signin` via auth-routes.ts.
 */

import { ThemeProvider } from '@/components/design-system/themes/ThemeProvider';
import { ProductThemeScope } from '@/components/brand/ProductThemeScope';
import { AppShell } from '@/components/suite/AppShell';
import { SuiteAuthProvider } from '@/components/suite/SuiteAuthContext';

export default function SuiteRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme="suite">
      <SuiteAuthProvider>
        <ProductThemeScope>
          <AppShell>{children}</AppShell>
        </ProductThemeScope>
      </SuiteAuthProvider>
    </ThemeProvider>
  );
}

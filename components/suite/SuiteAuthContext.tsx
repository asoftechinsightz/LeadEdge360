'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { LoadingSpinner } from '@/components/design-system/core/LoadingState';
import { buildSignInUrl, redirectToSignIn, isSuiteAuthGuardPath } from './auth-routes';
import { isPartnerRole, canAccessRoute } from '@/lib/nav/permissions';

export type SuiteUser = {
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  picture?: string;
  role?: string;
  orgName?: string;
  planCode?: string;
  activeProduct?: string;
};

type SuiteAuthContextValue = {
  user: SuiteUser | null;
  isAuthenticated: boolean;
  logout: () => void;
  getToken: () => string | null;
};

const SuiteAuthContext = React.createContext<SuiteAuthContextValue | null>(null);

export function SuiteAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = React.useState(false);
  const [user, setUser] = React.useState<SuiteUser | null>(null);

  React.useEffect(() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        redirectToSignIn(pathname || '/leadedge360');
        return;
      }

      const stored = localStorage.getItem('currentUser');
      let parsed: SuiteUser | null = null;
      if (stored) {
        parsed = JSON.parse(stored);
        setUser(parsed);
      }

      const role = (parsed as { role?: string })?.role;
      if (role && isPartnerRole(role)) {
        if (!pathname?.startsWith('/partners/dashboard')) {
          window.location.assign('/partners/dashboard');
          return;
        }
      } else if (role && pathname && isSuiteAuthGuardPath(pathname) && !canAccessRoute(role, pathname)) {
        window.location.assign('/invoices');
        return;
      }
    } catch (error) {
      console.error(error);
      redirectToSignIn();
      return;
    }

    setReady(true);
  }, [pathname]);

  const logout = React.useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error(error);
    }
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
    redirectToSignIn();
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Checking session">
        <LoadingSpinner className="size-10" />
      </div>
    );
  }

  return (
    <SuiteAuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        logout,
        getToken: () => (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null),
      }}
    >
      {children}
    </SuiteAuthContext.Provider>
  );
}

export function useSuiteAuth(): SuiteAuthContextValue {
  const context = React.useContext(SuiteAuthContext);
  if (!context) {
    throw new Error('useSuiteAuth must be used within SuiteAuthProvider');
  }
  return context;
}

/** @internal Exported for tests and auth verification docs. */
export { buildSignInUrl, redirectToSignIn };

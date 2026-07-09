'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/design-system/core/Button';
import { cn } from '@/lib/utils';
import { getNavGroupsForPath, filterNavGroupsByFeatures } from './nav-config';
import { useOrgFeatures } from '@/hooks/useFeatureFlag';
import { filterNavGroupsByRole } from '@/lib/nav/permissions';
import { useSuiteAuth } from '@/components/suite/SuiteAuthContext';
import { ProductSwitcher } from './ProductSwitcher';

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { user } = useSuiteAuth();
  const featuresQuery = useOrgFeatures();
  const features: string[] = featuresQuery.data?.data?.features || [];
  const role = (user as { role?: string })?.role;
  const navGroups = filterNavGroupsByRole(
    filterNavGroupsByFeatures(getNavGroupsForPath(pathname || ''), features),
    role,
  );

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Suite navigation">
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        aria-label="Close navigation menu"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col border-r border-border bg-card shadow-xl">
        <div className="flex h-16 items-center justify-end border-b border-border px-4">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X className="size-5" />
          </Button>
        </div>

        <div className="border-b border-border px-4 py-3">
          <ProductSwitcher className="w-full" />
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname?.startsWith(`${item.href}/`));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors',
                        active
                          ? 'bg-primary/15 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

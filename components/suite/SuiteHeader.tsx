'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, Plus } from 'lucide-react';
import { Button } from '@/components/design-system/core/Button';
import { GlobalSearch } from './GlobalSearch';
import { NotificationBell } from './NotificationBell';
import { ProductSwitcher } from './ProductSwitcher';
import { UserMenu } from './UserMenu';
import { EnvironmentBadge } from './EnvironmentBadge';

type SuiteHeaderProps = {
  onOpenMobileNav: () => void;
};

export function SuiteHeader({ onOpenMobileNav }: SuiteHeaderProps) {
  const [newOpen, setNewOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setNewOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const newItems = [
    { href: '/leads?new=1', label: 'New Lead' },
    { href: '/opportunities?new=1', label: 'New Opportunity' },
    { href: '/proposals?new=1', label: 'New Proposal' },
    { href: '/campaigns?new=1', label: 'New Campaign' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border brand-header-glass backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </Button>

        <div className="hidden shrink-0 lg:flex lg:items-center lg:gap-2">
          <EnvironmentBadge />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3 lg:pl-2">
          <GlobalSearch className="max-w-xl w-full" />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="relative hidden sm:block" ref={menuRef}>
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => setNewOpen((v) => !v)}
            >
              <Plus className="size-4 mr-1" /> New
            </Button>
            {newOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card shadow-lg py-1 z-50">
                {newItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 text-sm hover:bg-muted/50"
                    onClick={() => setNewOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NotificationBell />
          <ProductSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

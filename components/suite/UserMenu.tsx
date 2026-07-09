'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, User, LayoutDashboard, Building2, Shield, CreditCard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/design-system/core/Badge';
import { Button } from '@/components/design-system/core/Button';
import { SIGN_IN_PATH } from './auth-routes';
import { useSuiteAuth } from './SuiteAuthContext';
import { isLeadEdgePath, SUITE_PRODUCTS } from './nav-config';
import { useOrgFeatures } from '@/hooks/useFeatureFlag';

export function UserMenu() {
  const pathname = usePathname();
  const { user, logout } = useSuiteAuth();
  const orgFeatures = useOrgFeatures();
  const isLeadEdge = isLeadEdgePath(pathname || '');
  const displayName = user?.name || user?.fullName || 'User';
  const email = user?.email || '';
  const role = user?.role || 'User';
  const orgName = user?.orgName || orgFeatures.data?.data?.orgName || 'Organization';
  const planCode = user?.planCode || orgFeatures.data?.data?.planCode || 'STARTER';
  const activeProduct = pathname?.startsWith('/retailedge360')
    ? 'RetailEdge360'
    : (SUITE_PRODUCTS.find((p) => pathname === p.href || pathname?.startsWith(`${p.href}/`))?.label || 'LeadEdge360');
  const workspace = isLeadEdge ? `${activeProduct} · ${planCode}` : 'AsoftechInsightz Business Suite';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 py-1 pl-1 pr-2.5 transition hover:border-primary/40"
          aria-label="Account menu"
        >
          {user?.picture ? (
            <img src={user.picture} alt="" className="size-8 rounded-full object-cover" />
          ) : (
            <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-[hsl(var(--brand-orange))]/30 text-xs font-semibold text-primary">
              {initial}
            </div>
          )}
          <span className="hidden max-w-[100px] truncate text-sm md:inline">{displayName.split(' ')[0]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-[hsl(var(--brand-orange))]/30 text-sm font-bold text-primary">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate">{displayName}</div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">{email}</div>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <Badge variant="outline" className="text-[10px] h-5 gap-1 px-1.5">
                  <Shield className="size-3" />
                  {role}
                </Badge>
                <Badge variant="outline" className="text-[10px] h-5 gap-1 px-1.5 border-primary/30 text-primary">
                  <Building2 className="size-3" />
                  {orgName}
                </Badge>
                <Badge variant="outline" className="text-[10px] h-5 gap-1 px-1.5">
                  <CreditCard className="size-3" />
                  {planCode}
                </Badge>
                <Badge variant="outline" className="text-[10px] h-5 gap-1 px-1.5">
                  {activeProduct}
                </Badge>
              </div>
              <div className="text-[10px] text-muted-foreground mt-2">{workspace}</div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/leadedge360" className="cursor-pointer">
            <LayoutDashboard className="mr-2 size-4" />
            LeadEdge360
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/retailedge360" className="cursor-pointer">
            <LayoutDashboard className="mr-2 size-4" />
            RetailEdge360
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/product-selection" className="cursor-pointer">
            <User className="mr-2 size-4" />
            Product selection
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserMenuSignIn() {
  return (
    <Button asChild variant="accent" size="sm">
      <Link href={SIGN_IN_PATH}>Sign in</Link>
    </Button>
  );
}

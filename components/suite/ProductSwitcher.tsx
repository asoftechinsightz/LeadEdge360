'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/design-system/core/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { SUITE_PRODUCTS } from './nav-config';
import { PRODUCTS } from '@/lib/brand';

export function ProductSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();

  const active = pathname?.startsWith('/retailedge360')
    ? PRODUCTS.retailedge360
    : PRODUCTS.leadedge360;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn('gap-2 border border-border/60', className)}
          aria-label="Switch product"
        >
          <span className="max-w-[140px] truncate font-medium">{active.name}</span>
          <ChevronDown className="size-4 opacity-70" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Products</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUITE_PRODUCTS.map((product) => (
          <DropdownMenuItem key={product.id} asChild>
            <Link href={product.href} className="cursor-pointer flex flex-col items-start gap-0.5 py-2">
              <span className="font-medium">{product.label}</span>
              <span className="text-xs text-muted-foreground truncate">{product.description}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/product-selection" className="cursor-pointer">
            All products
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

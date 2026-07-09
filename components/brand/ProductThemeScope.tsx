'use client';

import { usePathname } from 'next/navigation';
import { getProductBrandFromPath } from '@/lib/brand';

/** Sets data-product for accent CSS (leadedge360 | retailedge360 | master) */
export function ProductThemeScope({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const product = getProductBrandFromPath(pathname);

  return (
    <div data-product={product} className="contents">
      {children}
    </div>
  );
}

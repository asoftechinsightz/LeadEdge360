import Image from 'next/image';

import Link from 'next/link';

import { PRODUCTS, BRAND_NAME } from '@/lib/brand';

import { cn } from '@/lib/utils';



type ProductShowcaseProps = {

  layout?: 'row' | 'grid';

  className?: string;

  showTaglines?: boolean;

};



const items = [PRODUCTS.leadedge360, PRODUCTS.retailedge360];



export function ProductShowcase({ layout = 'grid', className, showTaglines = true }: ProductShowcaseProps) {

  return (

    <div

      className={cn(

        layout === 'grid' ? 'grid sm:grid-cols-2 gap-4' : 'flex flex-wrap gap-4',

        className,

      )}

    >

      {items.map((product) => (

        <Link

          key={product.id}

          href={product.href}

          className="group brand-glass-card brand-gradient-border flex items-center gap-3 p-4 transition hover:opacity-95"

        >

          <Image

            src={product.logo}

            alt={product.name}

            width={120}

            height={40}

            className="h-10 w-auto object-contain object-left shrink-0"

          />

          {showTaglines && (

            <div className="min-w-0 hidden sm:block">

              <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">

                {product.tagline}

              </p>

              <p className="text-[10px] text-muted-foreground/70 mt-0.5">

                Powered by {BRAND_NAME}

              </p>

            </div>

          )}

        </Link>

      ))}

    </div>

  );

}


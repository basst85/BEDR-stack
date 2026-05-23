import { NavLink, Outlet } from 'react-router-dom';

import { shopGhostButtonClassName } from '@/components/shop/buttonStyles';
import { useCartCount } from '@/components/shop/shopStore';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ShopLayout() {
  const cartCount = useCartCount();

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-0 border border-black px-4 py-2 text-center text-[11px] tracking-[0.24em] text-black uppercase">
          Free shipping over $150
        </div>

        <header className="mb-10 border-x border-b border-black bg-white px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <nav className="flex flex-wrap gap-2 lg:justify-start">
              <NavLink
                to="/shop"
                end
                className={({ isActive }) =>
                  cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    shopGhostButtonClassName,
                    'px-3 text-[12px] tracking-[0.2em] uppercase hover:bg-transparent',
                    isActive ? 'border-black text-black' : 'text-black/65 hover:text-black',
                  )
                }
              >
                Shop
              </NavLink>
              <NavLink
                to="/shop/cart"
                className={({ isActive }) =>
                  cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    shopGhostButtonClassName,
                    'px-3 text-[12px] tracking-[0.2em] uppercase hover:bg-transparent',
                    isActive ? 'border-black text-black' : 'text-black/65 hover:text-black',
                  )
                }
              >
                Cart {cartCount ? `(${cartCount})` : ''}
              </NavLink>
            </nav>

            <div className="flex items-center justify-center gap-3">
              <Badge className="rounded-none border border-black bg-white px-3 py-1 text-[10px] tracking-[0.28em] text-black uppercase hover:bg-white">
                BEDR
              </Badge>
              <p className="text-sm tracking-[0.24em] uppercase">Store</p>
            </div>

            <div className="text-left text-[11px] tracking-[0.22em] text-black/55 uppercase lg:text-right">
              Default collection
            </div>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
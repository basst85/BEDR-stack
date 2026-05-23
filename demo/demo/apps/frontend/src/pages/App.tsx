import { NavLink, Outlet } from 'react-router-dom';

import { useCartCount } from '@/components/shop/shopStore';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function App() {
  const cartCount = useCartCount();

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="border-border/60 bg-card/90 mb-6 flex flex-col gap-4 rounded-3xl border p-6 shadow-2xl shadow-black/20 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary" className="w-fit tracking-[0.24em] uppercase">
            BEDR
          </Badge>
          <div className="space-y-1">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
              Workspace
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Account access and user management.
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(buttonVariants({ variant: isActive ? 'secondary' : 'ghost', size: 'sm' }))
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(buttonVariants({ variant: isActive ? 'secondary' : 'ghost', size: 'sm' }))
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/shop"
            className={({ isActive }) =>
              cn(buttonVariants({ variant: isActive ? 'secondary' : 'ghost', size: 'sm' }))
            }
          >
            Shop
          </NavLink>
          <NavLink
            to="/shop/cart"
            className={({ isActive }) =>
              cn(buttonVariants({ variant: isActive ? 'secondary' : 'ghost', size: 'sm' }))
            }
          >
            Cart {cartCount ? `(${cartCount})` : ''}
          </NavLink>
        </nav>
      </header>

      <Outlet />
    </main>
  );
}
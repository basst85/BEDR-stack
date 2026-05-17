import { NavLink, Outlet } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function App() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/90 p-6 shadow-2xl shadow-black/20 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary" className="w-fit uppercase tracking-[0.24em]">
            BEDR
          </Badge>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Workspace
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
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
        </nav>
      </header>

      <Outlet />
    </main>
  );
}

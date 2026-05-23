import { Outlet } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';

export function App() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="border-border/60 bg-card/90 mb-6 flex flex-col gap-4 rounded-3xl border p-6 shadow-2xl shadow-black/20 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary" className="w-fit tracking-[0.24em] uppercase">
            BEDR
          </Badge>
          <div className="space-y-1">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
              Starter
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Bun, React, and Elysia foundation for your next project.
            </p>
          </div>
        </div>
      </header>

      <Outlet />
    </main>
  );
}
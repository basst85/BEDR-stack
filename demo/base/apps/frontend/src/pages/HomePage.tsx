import { SeoHead } from '@/components/SeoHead';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function HomePage() {
  return (
    <>
      <SeoHead
        title="BEDR Starter"
        description="Base BEDR starter with Bun, React, Elysia, Drizzle, and shared workspace wiring."
        canonicalPath="/"
      />

      <section className="border-border/60 bg-card/90 rounded-3xl border p-8 shadow-2xl shadow-black/30 sm:p-10">
        <div className="space-y-5">
          <Badge variant="secondary" className="w-fit tracking-[0.24em] uppercase">
            Base project
          </Badge>
          <h2 className="text-foreground max-w-4xl text-4xl leading-none font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Start from the foundation, install the demo only when you need it.
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
            This default frontend contains only the shell and starter plumbing. Run{' '}
            <span className="font-mono">bun run demo:install</span> to copy the account,
            dashboard, and shop demo pages back into the app.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/90 shadow-xl shadow-black/20">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold tracking-tight">Included base</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground grid gap-3 text-sm">
            <p>React 19 + Vite frontend</p>
            <p>Elysia backend and Drizzle setup</p>
            <p>Shared workspace wiring and TypeScript config</p>
            <p>ESLint, Prettier, Docker, and build scripts</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/90 shadow-xl shadow-black/20">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold tracking-tight">Optional demo</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground grid gap-3 text-sm">
            <p>Home and dashboard auth demo</p>
            <p>Separate shop demo under /shop</p>
            <p>Demo-only Zustand cart state and product data</p>
            <p>Install with bun run demo:install, remove with bun run demo:remove</p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
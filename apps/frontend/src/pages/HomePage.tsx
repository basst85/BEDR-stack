import { SeoHead } from '@/components/SeoHead';

export function HomePage() {
  return (
    <>
      <SeoHead
        title="BEDR Starter"
        description="Base BEDR starter with Bun, React, Elysia, Drizzle"
        canonicalPath="/"
      />

      <section className="border-border/60 bg-card/90 rounded-3xl border p-8 sm:p-10">
        <div className="max-w-2xl space-y-4">
          <p className="text-muted-foreground text-sm sm:text-base">
            Run <span className="bg-muted text-foreground w-fit rounded-md px-3 py-2 font-mono text-sm">
              bun run demo:install
            </span> to copy the demo project.
          </p>
        </div>
      </section>
    </>
  );
}
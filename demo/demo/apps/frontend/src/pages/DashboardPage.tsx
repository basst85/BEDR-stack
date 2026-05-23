import { useQuery } from '@tanstack/react-query';
import { BarChart3, ShieldCheck, Users } from 'lucide-react';

import { DashboardMenuCard } from '@/components/DashboardMenuCard';
import { SeoHead } from '@/components/SeoHead';
import { SectionTile } from '@/components/SectionTile';
import { Badge } from '@/components/ui/badge';
import { sessionQueryOptions, usersQueryOptions } from '@/lib/api';

export function DashboardPage() {
  const sessionQuery = useQuery(sessionQueryOptions());

  const usersQuery = useQuery(usersQueryOptions());

  const session = sessionQuery.data;
  const users = usersQuery.data ?? [];

  return (
    <>
      <SeoHead
        title="Dashboard | BEDR"
        description="Review the current session and registered users in the protected BEDR dashboard."
        robots="noindex, nofollow"
      />

      <section className="border-border/60 bg-card/90 rounded-3xl border p-8 shadow-2xl shadow-black/30 sm:p-10">
        <div className="space-y-4">
          <Badge variant="secondary" className="w-fit tracking-[0.24em] uppercase">
            Dashboard
          </Badge>
          <div className="space-y-2">
            <h2 className="text-foreground text-4xl font-semibold tracking-tight sm:text-5xl">
              Workspace overview
            </h2>
            <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
              Review the current session and registered users.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <DashboardMenuCard />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <SectionTile
          eyebrow="Session"
          title="Signed-in user"
          description="Current account details."
          icon={
            <div className="border-primary/40 bg-primary/10 text-primary rounded-full border p-2">
              <ShieldCheck className="h-4 w-4" />
            </div>
          }
          contentClassName="space-y-4"
        >
          {session ? (
            <dl className="border-border/70 bg-muted/40 grid gap-4 rounded-2xl border p-4">
              <div className="grid gap-1">
                <dt className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">
                  Name
                </dt>
                <dd className="text-foreground text-base font-medium">{session.user.name}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-1">
                  <dt className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">
                    Email
                  </dt>
                  <dd className="text-foreground text-sm">{session.user.email}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">
                    User ID
                  </dt>
                  <dd className="overflow-wrap-anywhere text-foreground text-sm">
                    {session.user.id}
                  </dd>
                </div>
              </div>
            </dl>
          ) : (
            <p className="text-muted-foreground text-sm">Loading session...</p>
          )}
        </SectionTile>

        <SectionTile
          eyebrow="Users"
          title="User list"
          description={
            usersQuery.error ? usersQuery.error.message : `${users.length} registered user(s).`
          }
          icon={
            <div className="border-primary/40 bg-primary/10 text-primary rounded-full border p-2">
              <Users className="h-4 w-4" />
            </div>
          }
          actions={
            <div className="border-border/70 bg-muted/40 text-muted-foreground flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs tracking-[0.2em] uppercase">
              <BarChart3 className="h-3.5 w-3.5" />
              Synced
            </div>
          }
          contentClassName="space-y-4"
        >
          <ul className="grid gap-3">
            {users.map((user) => (
              <li
                key={user.id}
                className="border-border/60 bg-muted/40 grid gap-1 rounded-2xl border px-4 py-3 text-sm"
              >
                <strong className="text-foreground text-base">{user.name}</strong>
                <span className="text-muted-foreground">{user.email}</span>
                <time className="text-muted-foreground/80 text-xs" dateTime={user.createdAt}>
                  {new Date(user.createdAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        </SectionTile>
      </section>
    </>
  );
}
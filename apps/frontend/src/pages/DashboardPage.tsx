import { useQuery } from '@tanstack/react-query';
import { BarChart3, ShieldCheck, Users } from 'lucide-react';

import { DashboardMenuCard } from '@/components/DashboardMenuCard';
import { PageTitle } from '@/components/PageTitle';
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
      <PageTitle title="Dashboard" />

      <section className="rounded-3xl border border-border/60 bg-card/90 p-8 shadow-2xl shadow-black/30 sm:p-10">
        <div className="space-y-4">
          <Badge variant="secondary" className="w-fit uppercase tracking-[0.24em]">
            Dashboard
          </Badge>
          <div className="space-y-2">
            <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Workspace overview
            </h2>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
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
            <div className="rounded-full border border-primary/40 bg-primary/10 p-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
          }
          contentClassName="space-y-4"
        >
          {session ? (
            <dl className="grid gap-4 rounded-2xl border border-border/70 bg-muted/40 p-4">
              <div className="grid gap-1">
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Name
                </dt>
                <dd className="text-base font-medium text-foreground">{session.user.name}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-1">
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Email
                  </dt>
                  <dd className="text-sm text-foreground">{session.user.email}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    User ID
                  </dt>
                  <dd className="overflow-wrap-anywhere text-sm text-foreground">
                    {session.user.id}
                  </dd>
                </div>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Loading session...</p>
          )}
        </SectionTile>

        <SectionTile
          eyebrow="Users"
          title="User list"
          description={
            usersQuery.error ? usersQuery.error.message : `${users.length} registered user(s).`
          }
          icon={
            <div className="rounded-full border border-primary/40 bg-primary/10 p-2 text-primary">
              <Users className="h-4 w-4" />
            </div>
          }
          actions={
            <div className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
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
                className="grid gap-1 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-sm"
              >
                <strong className="text-base text-foreground">{user.name}</strong>
                <span className="text-muted-foreground">{user.email}</span>
                <time className="text-xs text-muted-foreground/80" dateTime={user.createdAt}>
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

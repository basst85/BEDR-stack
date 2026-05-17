import { Link, Outlet, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, LockKeyhole, ShieldAlert } from 'lucide-react';

import { PageTitle } from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMountEffect } from '@/hooks/useMountEffect';
import { sessionQueryOptions, usersQueryOptions } from '@/lib/api';

export function ProtectedRoute() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const sessionQuery = useQuery(sessionQueryOptions());

  useMountEffect(() => {
    void queryClient.prefetchQuery(usersQueryOptions());
  });

  if (sessionQuery.isPending) {
    return <ProtectedRouteLoadingState />;
  }

  if (sessionQuery.isError) {
    return <ProtectedRouteUnauthorizedState requestedPath={location.pathname} />;
  }

  return <Outlet />;
}

function ProtectedRouteLoadingState() {
  return (
    <section className="grid gap-5">
      <PageTitle title="BEDR Dashboard | Checking session" />

      <Card className="overflow-hidden border-border/60 bg-card/90 shadow-2xl shadow-black/20">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/60 bg-muted/20">
          <div className="rounded-full border border-primary/40 bg-primary/10 p-3 text-primary">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Checking session
            </CardTitle>
            <p className="max-w-xl text-sm text-muted-foreground">
              Verifying the dashboard cookie session before protected data is rendered.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-24 animate-pulse rounded-2xl border border-border/60 bg-muted/40" />
            <div className="h-24 animate-pulse rounded-2xl border border-border/60 bg-muted/40" />
            <div className="h-24 animate-pulse rounded-2xl border border-border/60 bg-muted/40" />
          </div>
          <div className="grid gap-3">
            <div className="h-16 animate-pulse rounded-2xl border border-border/60 bg-muted/40" />
            <div className="h-16 animate-pulse rounded-2xl border border-border/60 bg-muted/40" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

type ProtectedRouteUnauthorizedStateProps = {
  requestedPath: string;
};

function ProtectedRouteUnauthorizedState({ requestedPath }: ProtectedRouteUnauthorizedStateProps) {
  return (
    <section className="grid gap-5">
      <PageTitle title="BEDR Dashboard | Sign in required" />

      <Card className="overflow-hidden border-border/60 bg-card/90 shadow-2xl shadow-black/20">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 bg-muted/20 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="rounded-full border border-destructive/40 bg-destructive/10 p-3 text-destructive">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Sign in required
              </CardTitle>
              <p className="max-w-xl text-sm text-muted-foreground">
                The dashboard is protected. Sign in first to access {requestedPath}.
              </p>
            </div>
          </div>

          <Button asChild variant="secondary">
            <Link to="/" state={{ from: requestedPath }}>
              <ArrowLeft className="h-4 w-4" />
              Go to home
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6" />
      </Card>
    </section>
  );
}

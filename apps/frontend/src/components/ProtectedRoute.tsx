import { Link, Outlet, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, LockKeyhole, ShieldAlert } from 'lucide-react';

import { SeoHead } from '@/components/SeoHead';
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
      <SeoHead
        title="BEDR Dashboard | Checking session"
        description="Checking the current session before protected dashboard content is rendered."
        robots="noindex, nofollow"
      />

      <Card className="border-border/60 bg-card/90 overflow-hidden shadow-2xl shadow-black/20">
        <CardHeader className="border-border/60 bg-muted/20 flex flex-row items-start gap-4 space-y-0 border-b">
          <div className="border-primary/40 bg-primary/10 text-primary rounded-full border p-3">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Checking session
            </CardTitle>
            <p className="text-muted-foreground max-w-xl text-sm">
              Verifying the dashboard cookie session before protected data is rendered.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border-border/60 bg-muted/40 h-24 animate-pulse rounded-2xl border" />
            <div className="border-border/60 bg-muted/40 h-24 animate-pulse rounded-2xl border" />
            <div className="border-border/60 bg-muted/40 h-24 animate-pulse rounded-2xl border" />
          </div>
          <div className="grid gap-3">
            <div className="border-border/60 bg-muted/40 h-16 animate-pulse rounded-2xl border" />
            <div className="border-border/60 bg-muted/40 h-16 animate-pulse rounded-2xl border" />
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
      <SeoHead
        title="BEDR Dashboard | Sign in required"
        description="Sign in is required before the protected BEDR dashboard can be accessed."
        robots="noindex, nofollow"
      />

      <Card className="border-border/60 bg-card/90 overflow-hidden shadow-2xl shadow-black/20">
        <CardHeader className="border-border/60 bg-muted/20 flex flex-col gap-4 border-b sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-full border p-3">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Sign in required
              </CardTitle>
              <p className="text-muted-foreground max-w-xl text-sm">
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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { startTransition } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { SectionTile } from '@/components/SectionTile';
import { Button } from '@/components/ui/button';
import { logoutUser, queryKeys, sessionQueryOptions } from '@/lib/api';

export function DashboardMenuCard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sessionQuery = useQuery(sessionQueryOptions());
  const session = sessionQuery.data;

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users() });
      queryClient.removeQueries({ queryKey: queryKeys.session() });
      queryClient.removeQueries({ queryKey: queryKeys.users() });
      navigate('/', { replace: true, state: { loggedOut: true } });
    },
  });

  const refreshDashboard = () => {
    startTransition(() => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.session() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.users() }),
      ]);
    });
  };

  return (
    <SectionTile
      eyebrow="Overview"
      title="Actions"
      description="Refresh your data, return home, or end the current session."
      icon={
        <div className="rounded-full border border-primary/40 bg-primary/10 p-2 text-primary">
          <ShieldCheck className="h-4 w-4" />
        </div>
      }
      actions={
        <div className="rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Signed in
        </div>
      }
      contentClassName="grid gap-5"
    >
      <div className="grid gap-4">
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Current session
          </p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            {session?.user.name ?? 'Authenticated user'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {session?.user.email ?? 'Session details are shown here.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={refreshDashboard}>
            <RefreshCw className="h-4 w-4" />
            Refresh data
          </Button>
          <Button asChild type="button" variant="outline">
            <Link to="/">
              <ArrowRight className="h-4 w-4" />
              Overview
            </Link>
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void logoutMutation.mutateAsync()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
            {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
          </Button>
        </div>
      </div>
    </SectionTile>
  );
}

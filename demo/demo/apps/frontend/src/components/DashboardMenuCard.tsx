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
        <div className="border-primary/40 bg-primary/10 text-primary rounded-full border p-2">
          <ShieldCheck className="h-4 w-4" />
        </div>
      }
      actions={
        <div className="border-border/70 bg-muted/40 text-muted-foreground rounded-full border px-3 py-1.5 text-xs tracking-[0.2em] uppercase">
          Signed in
        </div>
      }
      contentClassName="grid gap-5"
    >
      <div className="grid gap-4">
        <div className="border-border/60 bg-muted/40 rounded-2xl border p-4">
          <p className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">
            Current session
          </p>
          <p className="text-foreground mt-2 text-xl font-semibold tracking-tight">
            {session?.user.name ?? 'Authenticated user'}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
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
import { useActionState, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchSession, loginUser, logoutUser, queryKeys, type SessionResponse } from '@/lib/api';
import { cn } from '@/lib/utils';

import { SectionTile } from './SectionTile';

type SessionState = {
  kind: 'idle' | 'success' | 'error';
  message: string;
  resetKey: number;
};

const initialState: SessionState = {
  kind: 'idle',
  message: 'Sign in with your account details.',
  resetKey: 0,
};

export function DemoLoginPanel() {
  const queryClient = useQueryClient();
  const [localState, setLocalState] = useState<SessionState | null>(null);

  const sessionQuery = useQuery({
    queryKey: queryKeys.session(),
    queryFn: fetchSession,
    enabled: false,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
  });

  const [state, submitLogin, isLoginPending] = useActionState(
    async (_previousState: SessionState, formData: FormData) => {
      const email = String(formData.get('email') ?? '').trim();
      const password = String(formData.get('password') ?? '').trim();

      if (!email || !password) {
        return {
          kind: 'error',
          message: 'Email and password are required.',
          resetKey: 0,
        } satisfies SessionState;
      }

      try {
        const session = await loginMutation.mutateAsync({ email, password });

        queryClient.setQueryData(queryKeys.session(), session);

        return {
          kind: 'success',
          message: `Welcome back, ${session.user.name}.`,
          resetKey: Date.now(),
        } satisfies SessionState;
      } catch (error) {
        return {
          kind: 'error',
          message: error instanceof Error ? error.message : 'Could not connect to the auth API.',
          resetKey: 0,
        } satisfies SessionState;
      }
    },
    initialState,
  );

  const updateSession = async () => {
    const result = await sessionQuery.refetch();

    if (result.error || !result.data) {
      setLocalState({
        kind: 'error',
        message: 'No active session found.',
        resetKey: 0,
      });
      return;
    }

    setLocalState({
      kind: 'success',
      message: `Signed in as ${result.data.user.name}.`,
      resetKey: state.resetKey,
    });
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      queryClient.removeQueries({ queryKey: queryKeys.session() });
      queryClient.removeQueries({ queryKey: queryKeys.users() });

      setLocalState({
        kind: 'idle',
        message: 'Session cleared.',
        resetKey: 0,
      });
    } catch {
      setLocalState({
        kind: 'error',
        message: 'Could not clear the session.',
        resetKey: state.resetKey,
      });
    }
  };

  const effectiveState = localState ?? state;
  const pending = isLoginPending || logoutMutation.isPending || sessionQuery.isFetching;
  const session =
    (queryClient.getQueryData(queryKeys.session()) as SessionResponse | undefined) ??
    sessionQuery.data;

  return (
    <SectionTile
      eyebrow="Account"
      title="Sign in"
      description="Access your workspace with your email address and password."
      className="xl:col-span-2"
      contentClassName="space-y-4"
      icon={
        <div className="border-primary/40 bg-primary/10 text-primary rounded-full border p-2">
          <ShieldCheck className="h-4 w-4" />
        </div>
      }
    >
      <form
        key={effectiveState.resetKey}
        className="grid gap-4"
        action={submitLogin}
        onSubmit={() => setLocalState(null)}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="demo-login-email">Email</Label>
            <Input
              id="demo-login-email"
              name="email"
              type="email"
              placeholder="ada@example.com"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="demo-login-password">Password</Label>
            <Input
              id="demo-login-password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={pending}>
            {isLoginPending ? 'Signing in...' : 'Sign in'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void updateSession()}
            disabled={pending}
          >
            {sessionQuery.isFetching ? 'Checking...' : 'Check status'}
          </Button>
          <Button type="button" variant="outline" onClick={() => void logout()} disabled={pending}>
            {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
          </Button>
        </div>
      </form>

      <p
        data-kind={effectiveState.kind}
        className={cn(
          'text-muted-foreground text-sm',
          effectiveState.kind === 'success' && 'text-emerald-400',
          effectiveState.kind === 'error' && 'text-destructive',
        )}
      >
        {effectiveState.message}
      </p>

      {session ? (
        <dl className="border-border/70 bg-muted/40 grid gap-4 rounded-2xl border p-4 sm:grid-cols-3">
          <div className="grid gap-1">
            <dt className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">Name</dt>
            <dd className="text-foreground text-sm">{session.user.name}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">Email</dt>
            <dd className="text-foreground text-sm">{session.user.email}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">
              User ID
            </dt>
            <dd className="overflow-wrap-anywhere text-foreground text-sm">{session.user.id}</dd>
          </div>
        </dl>
      ) : null}
    </SectionTile>
  );
}

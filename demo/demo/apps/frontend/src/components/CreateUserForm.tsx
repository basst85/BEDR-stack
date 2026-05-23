import { useActionState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { queryKeys, registerUser } from '@/lib/api';
import { cn } from '@/lib/utils';

import { SectionTile } from './SectionTile';

type CreateUserState = {
  message: string;
  kind: 'idle' | 'success' | 'error';
  resetKey: number;
};

const initialState: CreateUserState = {
  message: 'Create a new account.',
  kind: 'idle',
  resetKey: 0,
};

export function CreateUserForm() {
  const queryClient = useQueryClient();

  const registrationMutation = useMutation({
    mutationFn: registerUser,
  });

  const submitRegistration = async (_previousState: CreateUserState, formData: FormData) => {
    const email = String(formData.get('email') ?? '').trim();
    const name = String(formData.get('name') ?? '').trim();
    const password = String(formData.get('password') ?? '').trim();

    if (!email || !name || !password) {
      return {
        kind: 'error',
        message: 'Name, email, and password are required.',
        resetKey: 0,
      } satisfies CreateUserState;
    }

    try {
      const user = await registrationMutation.mutateAsync({
        email,
        name,
        password,
      });

      await queryClient.invalidateQueries({ queryKey: queryKeys.users() });

      return {
        kind: 'success',
        message: `Account for ${user.name} was created.`,
        resetKey: Date.now(),
      } satisfies CreateUserState;
    } catch (error) {
      return {
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not save the user.',
        resetKey: 0,
      } satisfies CreateUserState;
    }
  };

  const [state, formAction, isPending] = useActionState(submitRegistration, initialState);

  return (
    <SectionTile
      eyebrow="Users"
      title="Create account"
      description="Add a user who can sign in to the workspace."
    >
      <form key={state.resetKey} className="grid gap-4" action={formAction}>
        <div className="grid gap-2">
          <Label htmlFor="create-user-name">Name</Label>
          <Input
            id="create-user-name"
            name="name"
            type="text"
            placeholder="Ada Lovelace"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="create-user-email">Email</Label>
          <Input
            id="create-user-email"
            name="email"
            type="email"
            placeholder="ada@example.com"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="create-user-password">Password</Label>
          <Input
            id="create-user-password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </div>

        <Button type="submit" disabled={isPending} className="mt-2 w-full sm:w-fit">
          {isPending ? 'Creating...' : 'Create account'}
        </Button>

        <p
          data-kind={state.kind}
          className={cn(
            'text-muted-foreground text-sm',
            state.kind === 'success' && 'text-emerald-400',
            state.kind === 'error' && 'text-destructive',
          )}
        >
          {state.message}
        </p>
      </form>
    </SectionTile>
  );
}
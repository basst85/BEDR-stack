import { useState } from 'react';
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
};

const initialState: CreateUserState = {
  message: 'Create a new account.',
  kind: 'idle',
};

export function CreateUserForm() {
  const [state, setState] = useState<CreateUserState>(initialState);
  const queryClient = useQueryClient();

  const registrationMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: async (user) => {
      setState({
        kind: 'success',
        message: `Account for ${user.name} was created.`,
      });

      await queryClient.invalidateQueries({ queryKey: queryKeys.users() });
    },
    onError: (error) => {
      setState({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not save the user.',
      });
    },
  });

  const handleSubmit = async (formData: FormData) => {
    const email = String(formData.get('email') ?? '').trim();
    const name = String(formData.get('name') ?? '').trim();
    const password = String(formData.get('password') ?? '').trim();

    if (!email || !name || !password) {
      setState({
        kind: 'error',
        message: 'Name, email, and password are required.',
      });
      return;
    }

    await registrationMutation.mutateAsync({
      email,
      name,
      password,
    });
  };

  return (
    <SectionTile
      eyebrow="Users"
      title="Create account"
      description="Add a user who can sign in to the workspace."
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit(new FormData(event.currentTarget));
        }}
      >
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

        <Button
          type="submit"
          disabled={registrationMutation.isPending}
          className="mt-2 w-full sm:w-fit"
        >
          {registrationMutation.isPending ? 'Working...' : 'Create account'}
        </Button>

        <p
          data-kind={state.kind}
          className={cn(
            'text-sm text-muted-foreground',
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

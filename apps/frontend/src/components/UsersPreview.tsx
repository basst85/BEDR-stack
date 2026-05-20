import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { fetchUsers, queryKeys } from '@/lib/api';

import { SectionTile } from './SectionTile';

export function UsersPreview() {
  const usersQuery = useQuery({
    queryKey: queryKeys.users(),
    queryFn: fetchUsers,
    enabled: false,
    retry: false,
  });

  const loadUsers = async () => {
    await usersQuery.refetch();
  };

  const status = usersQuery.isFetching
    ? 'Loading users...'
    : usersQuery.error
      ? usersQuery.error.message
      : usersQuery.data
        ? `${usersQuery.data.length} user(s) found.`
        : 'Load the current users.';

  return (
    <SectionTile
      eyebrow="Directory"
      title="Users"
      description={status}
      className="xl:col-span-1"
      actions={
        <Button type="button" variant="secondary" onClick={() => void loadUsers()}>
          {usersQuery.isFetching ? 'Refreshing...' : 'Load users'}
        </Button>
      }
    >
      <ul className="grid gap-3">
        {(usersQuery.data ?? []).map((user) => (
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
  );
}

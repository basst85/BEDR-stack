import { CreateUserForm } from '@/components/CreateUserForm';
import { DemoLoginPanel } from '@/components/DemoLoginPanel';
import { PageTitle } from '@/components/PageTitle';
import { UsersPreview } from '@/components/UsersPreview';

export function HomePage() {
  return (
    <>
      <PageTitle title="BEDR" />

      <section className="rounded-3xl border border-border/60 bg-card/90 p-8 shadow-2xl shadow-black/30 sm:p-10">
        <div className="space-y-5">
          <h2 className="max-w-4xl text-4xl leading-none font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Manage your account and workspace access.
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Create an account, sign in, and show the current user details.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-5">
        <DemoLoginPanel />
        <CreateUserForm />
        <UsersPreview />
      </section>
    </>
  );
}

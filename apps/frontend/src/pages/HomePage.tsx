import { CreateUserForm } from '@/components/CreateUserForm';
import { DemoLoginPanel } from '@/components/DemoLoginPanel';
import { SeoHead } from '@/components/SeoHead';
import { UsersPreview } from '@/components/UsersPreview';

export function HomePage() {
  return (
    <>
      <SeoHead
        title="BEDR | Account and workspace access"
        description="Create an account, sign in, and manage workspace access in the BEDR demo application."
        canonicalPath="/"
      />

      <section className="border-border/60 bg-card/90 rounded-3xl border p-8 shadow-2xl shadow-black/30 sm:p-10">
        <div className="space-y-5">
          <h2 className="text-foreground max-w-4xl text-4xl leading-none font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Manage your account and workspace access.
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
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

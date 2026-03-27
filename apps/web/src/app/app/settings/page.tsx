import { currentUsr } from "@lib/auth";

import NewUserForm from "./NewUserForm";


export const metadata = {
  title: "FlockNerd - Account Settings",
  description: "Flock Stats for Nerds",
};

export const runtime = "nodejs";

const Settings = async () => {
  const user = await currentUsr();

  return (
    <main className="mx-auto flex h-full w-full max-w-4xl justify-center p-4 lg:h-auto lg:p-8 lg:px-[3.5vw]">
      <section className="w-full rounded-3xl bg-[#FEF9F6] p-6 text-primary shadow-sm sm:p-8">
        <div className="border-b border-primary/10 pb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/60">
            Account settings
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your FlockNerd profile</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-primary/70">
            This screen is app-owned now. Clerk still handles authentication and sessions in the background.
          </p>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <NewUserForm
              user={{
                id: user.id,
                name: user.name ?? user.fullName,
                email:
                  user.email ?? user.primaryEmailAddress?.emailAddress ?? null,
                image: user.image ?? user.imageUrl,
              }}
            />
          </div>

          <aside className="space-y-4 rounded-2xl border border-primary/10 bg-white p-5">
            <div>
              <h2 className="text-lg font-semibold">Authentication</h2>
              <p className="mt-2 text-sm text-primary/70">
                Signed in as {user.email ?? user.primaryEmailAddress?.emailAddress ?? "your Clerk account"}.
              </p>
            </div>

            <div className="rounded-2xl bg-primary/5 p-4 text-sm leading-6 text-primary/75">
              Passwords, sessions, and identity verification still run through Clerk. This page now owns the product UI and profile editing flow.
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Settings;

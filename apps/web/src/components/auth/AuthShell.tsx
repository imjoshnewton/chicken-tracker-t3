import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import logo from "../../../public/FlockNerd-logo-v2.png";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-primary/5 px-4 py-10 text-primary sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-8 rounded-3xl bg-white p-6 shadow-xl shadow-primary/10 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <section className="flex flex-col justify-between rounded-2xl bg-primary px-6 py-8 text-[#FEF9F6]">
            <div>
              <Link href="/" className="inline-flex items-center" aria-label="Go home">
                <Image
                  src={logo}
                  height={56}
                  alt="FlockNerd logo"
                  priority
                />
              </Link>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
                FlockNerd account
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {title}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/80 sm:text-base">
                {description}
              </p>
            </div>
            <div className="mt-10 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-white/80">
              Product-owned auth UI, Clerk-backed sessions, and deterministic app redirects.
            </div>
          </section>
          <section className="flex items-center justify-center">{children}</section>
        </div>
      </div>
    </main>
  );
}


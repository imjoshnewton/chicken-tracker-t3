"use client";

import { FormEvent, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useClerk, useSignIn } from "@clerk/nextjs";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

import { getClerkErrorMessage } from "./clerk-errors";

export function SignInForm({ redirectUrl }: { redirectUrl: string }) {
  const router = useRouter();
  const { isLoaded, signIn } = useSignIn();
  const { setActive } = useClerk();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isLoaded) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn.create({
        strategy: "password",
        identifier: emailAddress,
        password,
      });

      if (result.status !== "complete" || !result.createdSessionId) {
        setError("This sign-in flow needs an extra step that is not yet supported here.");
        return;
      }

      await setActive({
        session: result.createdSessionId,
        navigate: async () => {
          router.replace(redirectUrl);
        },
      });
    } catch (err) {
      setError(getClerkErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-[#FEF9F6] p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-primary">Sign in</h2>
        <p className="mt-2 text-sm text-primary/70">
          Welcome back. Use your email and password to continue.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={emailAddress}
            onChange={(event) => setEmailAddress(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-11 w-full bg-primary text-white hover:bg-primary/90"
          disabled={!isLoaded || isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Continue"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-primary/70">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/sign-up"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

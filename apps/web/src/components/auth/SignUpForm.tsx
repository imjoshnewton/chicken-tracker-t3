"use client";

import { FormEvent, useMemo, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useClerk, useSignUp } from "@clerk/nextjs";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

import { getClerkErrorMessage } from "./clerk-errors";

type VerificationState = "details" | "verify-email";

export function SignUpForm({ redirectUrl }: { redirectUrl: string }) {
  const router = useRouter();
  const { isLoaded, signUp } = useSignUp();
  const { setActive } = useClerk();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<VerificationState>("details");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fullNamePreview = useMemo(() => {
    return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
  }, [firstName, lastName]);

  const completeSignUp = async (sessionId: string | null) => {
    if (!sessionId) {
      setError("Account created, but no active session was returned.");
      return;
    }

    await setActive({
      session: sessionId,
      navigate: async () => {
        router.replace(redirectUrl);
      },
    });
  };

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isLoaded) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signUp.create({
        emailAddress,
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });

      if (result.status === "complete") {
        await completeSignUp(result.createdSessionId);
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify-email");
    } catch (err) {
      setError(getClerkErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isLoaded) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status !== "complete") {
        setError("Verification is not complete yet. Double-check the code and try again.");
        return;
      }

      await completeSignUp(result.createdSessionId);
    } catch (err) {
      setError(getClerkErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-[#FEF9F6] p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-primary">Create your account</h2>
        <p className="mt-2 text-sm text-primary/70">
          Sign up in FlockNerd, then hand off directly into onboarding.
        </p>
      </div>

      {step === "details" ? (
        <form className="space-y-4" onSubmit={handleCreateAccount}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Josh"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Newton"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={emailAddress}
              onChange={(event) => setEmailAddress(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
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
            {isSubmitting ? "Creating account..." : "Continue"}
          </Button>

          <p className="text-xs leading-5 text-primary/60">
            {fullNamePreview
              ? `This account will be created for ${fullNamePreview}.`
              : "You can add your name now or update it later in account settings."}
          </p>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleVerifyEmail}>
          <div className="rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm text-primary/75">
            Enter the verification code sent to <span className="font-semibold">{emailAddress}</span>.
          </div>

          <div className="space-y-2">
            <Label htmlFor="verificationCode">Email verification code</Label>
            <Input
              id="verificationCode"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
              placeholder="123456"
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
            {isSubmitting ? "Verifying..." : "Verify email and continue"}
          </Button>

          <Button
            type="button"
            variant="link"
            className="h-auto w-full px-0 text-sm font-medium text-primary"
            onClick={async () => {
              if (!isLoaded) {
                return;
              }

              setError(null);

              try {
                await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
              } catch (err) {
                setError(getClerkErrorMessage(err));
              }
            }}
          >
            Resend code
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-primary/70">
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

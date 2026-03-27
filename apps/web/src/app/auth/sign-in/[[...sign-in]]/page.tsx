import { AuthShell } from "@components/auth/AuthShell";
import { SignInForm } from "@components/auth/SignInForm";

import { getDefaultSignInRedirect } from "@lib/auth-redirect";

interface SignInPageProps {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await searchParams;
  const redirectUrl = getDefaultSignInRedirect(resolvedSearchParams.redirect_url);

  return (
    <AuthShell
      title="Sign in to FlockNerd"
      description="Use the app’s own sign-in flow so redirects, onboarding, and browser testing stay predictable."
    >
      <SignInForm redirectUrl={redirectUrl} />
    </AuthShell>
  );
}

import { AuthShell } from "@components/auth/AuthShell";
import { SignUpForm } from "@components/auth/SignUpForm";

import { getDefaultSignUpRedirect } from "@lib/auth-redirect";

export default function Page() {
  return (
    <AuthShell
      title="Create your FlockNerd account"
      description="Finish sign-up in app-owned UI, then land directly in onboarding so the app controls the next step."
    >
      <SignUpForm redirectUrl={getDefaultSignUpRedirect()} />
    </AuthShell>
  );
}

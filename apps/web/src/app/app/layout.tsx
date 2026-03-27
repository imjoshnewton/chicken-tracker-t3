import { currentUsr } from "@lib/auth";
import {
  FLOCK_ONBOARDING_ROUTE,
  getFlockOnboardingHandoffPath,
  isFlockOnboardingComplete,
  normalizeFlockOnboardingContext,
} from "@lib/onboarding";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getServerClient } from "../_trpc/serverClient";
import AppLayout from "./AppLayout";
import { TrpcProvider } from "./Provider";

export const metadata = {
  title: "FlockNerd - Egg-ceptional Insights",
  description: "Flock Stats for Nerds",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUsr();
  const pathname = (await headers()).get("x-pathname") ?? "/app";
  const isOnboardingRoute = pathname.startsWith(FLOCK_ONBOARDING_ROUTE);
  const onboardingComplete = isFlockOnboardingComplete(user);

  if (!onboardingComplete && !isOnboardingRoute) {
    redirect(FLOCK_ONBOARDING_ROUTE);
  }

  if (onboardingComplete && isOnboardingRoute) {
    redirect(
      getFlockOnboardingHandoffPath(
        user,
        normalizeFlockOnboardingContext((user as any).onboardingContext),
      ),
    );
  }

  const authRes = await auth();
  const serverClient = getServerClient(authRes);
  const notifications = isOnboardingRoute
    ? []
    : await serverClient.auth.getUserNotifications();

  return (
    <TrpcProvider>
      <AppLayout
        initialNotifications={notifications}
        onboardingActive={isOnboardingRoute && !onboardingComplete}
      >
        {children}
      </AppLayout>
    </TrpcProvider>
  );
}

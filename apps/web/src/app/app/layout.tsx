import { currentUsr } from "@lib/auth";
import {
  FLOCK_ONBOARDING_ROUTE,
  isFlockOnboardingComplete,
} from "@lib/onboarding";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import * as flocksService from "../../services/flocks.service";
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
    redirect(await flocksService.getUserFlockLandingPath(user.id));
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

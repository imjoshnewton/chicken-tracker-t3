import { currentUsr } from "@lib/auth";
import type { Breed, Flock } from "@lib/db/schema-postgres";
import {
  clampFlockOnboardingStep,
  normalizeFlockOnboardingContext,
} from "@lib/onboarding";
import * as flocksService from "../../../services/flocks.service";
import * as onboardingService from "../../../services/onboarding.service";
import { OnboardingShell } from "./onboarding-shell";

export const metadata = {
  title: "FlockNerd - Onboarding",
  description: "Set up your flock tracking workspace",
};

export const runtime = "nodejs";

export default async function OnboardingPage(props: any) {
  const user = await currentUsr();
  const searchParams = await props.searchParams;
  const requestedStep = Number(searchParams?.step ?? Number.NaN);
  const onboardingState = await onboardingService.getOnboardingState(user.id);
  const unlockedStep = clampFlockOnboardingStep(
    onboardingState.onboardingCurrentStep ?? 1,
  );
  const currentStep = Number.isFinite(requestedStep)
    ? clampFlockOnboardingStep(Math.min(requestedStep, unlockedStep))
    : unlockedStep;
  const context = normalizeFlockOnboardingContext(onboardingState.onboardingContext);
  const flockId = context.flock?.flockId || onboardingState.defaultFlock;

  let summaryFlock: (Flock & { breeds: Breed[] }) | null = null;

  if (flockId) {
    summaryFlock = (await flocksService.getFlockById(flockId)) as
      | (Flock & { breeds: Breed[] })
      | null;
  }

  return (
    <OnboardingShell
      currentStep={currentStep}
      unlockedStep={unlockedStep}
      context={context}
      summaryFlock={summaryFlock}
    />
  );
}

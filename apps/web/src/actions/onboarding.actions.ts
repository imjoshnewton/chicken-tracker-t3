"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { currentUsr } from "@lib/auth";
import { FLOCK_ONBOARDING_ROUTE } from "@lib/onboarding";
import * as onboardingService from "../services/onboarding.service";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function getErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Validation error";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

async function getCurrentDbUserId() {
  const user = await currentUsr();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  return user.id;
}

function revalidateOnboardingPaths() {
  revalidatePath("/app");
  revalidatePath(FLOCK_ONBOARDING_ROUTE);
  revalidatePath("/app/flocks");
  revalidatePath("/app/settings");
}

export async function saveWelcomeSetup(input: {
  setupIntent: "starting_fresh" | "migrating_existing_records" | "backfilling_recent_activity";
  primaryGoal: "egg_tracking" | "flock_organization" | "routine_planning";
}): Promise<ActionResult<{ nextStep: number }>> {
  try {
    const userId = await getCurrentDbUserId();
    const result = await onboardingService.saveWelcomeContext(userId, input);
    revalidateOnboardingPaths();
    return { success: true, data: { nextStep: result.currentStep } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function saveFirstFlockSetup(input: {
  name: string;
  description: string;
  type: string;
}): Promise<ActionResult<{ nextStep: number; flockId: string }>> {
  try {
    const userId = await getCurrentDbUserId();
    const result = await onboardingService.saveFirstFlock(userId, input);
    revalidateOnboardingPaths();
    revalidatePath(`/app/flocks/${result.flockId}`);
    return {
      success: true,
      data: { nextStep: result.currentStep, flockId: result.flockId },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function saveBreedGroupSetup(input: {
  groups: Array<{
    id?: string;
    name: string;
    breed: string;
    description: string;
    count: number;
    averageProduction: number;
  }>;
}): Promise<ActionResult<{ nextStep: number; flockId: string }>> {
  try {
    const userId = await getCurrentDbUserId();
    const result = await onboardingService.saveBreedGroups(userId, input);
    revalidateOnboardingPaths();
    revalidatePath(`/app/flocks/${result.flockId}`);
    return {
      success: true,
      data: { nextStep: result.currentStep, flockId: result.flockId },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function saveOptionalEggLog(input: {
  skipped: boolean;
  date?: string;
  count?: number;
  breedId?: string;
  notes?: string;
}): Promise<ActionResult<{ nextStep: number }>> {
  try {
    const userId = await getCurrentDbUserId();
    const result = await onboardingService.saveFirstEggLog(userId, input);
    revalidateOnboardingPaths();
    return { success: true, data: { nextStep: result.currentStep } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function finishOnboarding(): Promise<ActionResult<{ handoffPath: string }>> {
  try {
    const userId = await getCurrentDbUserId();
    const result = await onboardingService.completeOnboarding(userId);
    revalidateOnboardingPaths();
    revalidatePath(result.handoffPath);
    return { success: true, data: { handoffPath: result.handoffPath } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

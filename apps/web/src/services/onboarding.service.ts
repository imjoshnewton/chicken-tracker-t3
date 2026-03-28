import { createId } from "@paralleldrive/cuid2";
import { format } from "date-fns";

import { db } from "@lib/db";
import { withTransaction } from "@lib/db/utils";
import {
  breedGroupListSchema,
  clampFlockOnboardingStep,
  firstEggLogSchema,
  firstFlockSchema,
  flockWelcomeSchema,
  normalizeFlockOnboardingContext,
  type BreedGroupListInput,
  type FirstEggLogInput,
  type FirstFlockInput,
  type FlockOnboardingContext,
  type FlockWelcomeInput,
} from "@lib/onboarding";
import * as breedsRepo from "../data/breeds.repository";
import * as flocksRepo from "../data/flocks.repository";
import * as logsRepo from "../data/logs.repository";
import * as onboardingRepo from "../data/onboarding.repository";
import { getUserFlockLandingPath } from "./flocks.service";

function nowIsoString() {
  return new Date().toISOString();
}

async function getRequiredState(userId: string) {
  const existing = await onboardingRepo.getUserOnboardingState(db, userId);

  if (!existing) {
    throw new Error("User not found");
  }

  return {
    ...existing,
    onboardingContext: normalizeFlockOnboardingContext(existing.onboardingContext),
  };
}

function getNextUnlockedStep(currentStep: number | null | undefined, nextStep: number) {
  return clampFlockOnboardingStep(Math.max(currentStep ?? 1, nextStep));
}

export async function getOnboardingState(userId: string) {
  return getRequiredState(userId);
}

export async function saveWelcomeContext(userId: string, input: FlockWelcomeInput) {
  const validated = flockWelcomeSchema.parse(input);
  const existing = await getRequiredState(userId);
  const onboardingContext: FlockOnboardingContext = {
    ...existing.onboardingContext,
    welcome: validated,
  };

  const [updated] = await onboardingRepo.updateUserOnboardingState(db, userId, {
    onboardingStartedAt: existing.onboardingStartedAt ?? nowIsoString(),
    onboardingCurrentStep: getNextUnlockedStep(existing.onboardingCurrentStep, 2),
    onboardingContext,
  });

  return {
    currentStep: updated?.onboardingCurrentStep ?? 2,
    context: onboardingContext,
  };
}

export async function saveFirstFlock(userId: string, input: FirstFlockInput) {
  const validated = firstFlockSchema.parse({
    ...input,
    name: input.name.trim() || input.description.trim(),
  });

  return withTransaction(async (tx) => {
    const existing = await onboardingRepo.getUserOnboardingState(tx, userId);

    if (!existing) {
      throw new Error("User not found");
    }

    const context = normalizeFlockOnboardingContext(existing.onboardingContext);
    const flockId = context.flock?.flockId || createId();

    if (context.flock?.flockId) {
      await flocksRepo.updateFlock(tx, flockId, {
        name: validated.name,
        description: validated.description,
        type: validated.type,
        imageUrl: "",
      });
    } else {
      await flocksRepo.createFlock(tx, {
        id: flockId,
        userId,
        name: validated.name,
        description: validated.description,
        type: validated.type,
        imageUrl: "",
      });
    }

    const nextContext: FlockOnboardingContext = {
      ...context,
      flock: {
        flockId,
        name: validated.name,
        description: validated.description,
        type: validated.type,
      },
    };

    const [updated] = await onboardingRepo.updateUserOnboardingState(tx, userId, {
      defaultFlock: existing.defaultFlock || flockId,
      onboardingStartedAt: existing.onboardingStartedAt ?? nowIsoString(),
      onboardingCurrentStep: getNextUnlockedStep(existing.onboardingCurrentStep, 3),
      onboardingContext: nextContext,
    });

    return {
      flockId,
      currentStep: updated?.onboardingCurrentStep ?? 3,
      context: nextContext,
    };
  }, { maxRetries: 2, operation: "Save first flock" });
}

export async function saveBreedGroups(userId: string, input: BreedGroupListInput) {
  const validated = breedGroupListSchema.parse(input);

  return withTransaction(async (tx) => {
    const existing = await onboardingRepo.getUserOnboardingState(tx, userId);

    if (!existing) {
      throw new Error("User not found");
    }

    const context = normalizeFlockOnboardingContext(existing.onboardingContext);
    const flockId = context.flock?.flockId || existing.defaultFlock;

    if (!flockId) {
      throw new Error("Create a flock before adding breed groups");
    }

    const previousBreedIds = new Set(
      (context.breedGroups ?? []).map((group) => group.id).filter(Boolean) as string[],
    );
    const nextGroups: NonNullable<FlockOnboardingContext["breedGroups"]> = [];
    const submittedIds = new Set<string>();

    for (const group of validated.groups) {
      const breedId = group.id || createId();
      submittedIds.add(breedId);

      if (group.id) {
        await breedsRepo.updateBreed(tx, {
          id: breedId,
          flockId,
          name: group.name,
          breed: group.breed,
          description: group.description ?? "",
          count: group.count,
          averageProduction: group.averageProduction,
          imageUrl: "",
        });
      } else {
        await breedsRepo.createBreed(tx, {
          id: breedId,
          flockId,
          name: group.name,
          breed: group.breed,
          description: group.description ?? "",
          count: group.count,
          averageProduction: group.averageProduction,
          imageUrl: "",
        });
      }

      nextGroups.push({
        id: breedId,
        name: group.name,
        breed: group.breed,
        description: group.description ?? "",
        count: group.count,
        averageProduction: group.averageProduction,
      });
    }

    for (const staleBreedId of previousBreedIds) {
      if (!submittedIds.has(staleBreedId)) {
        await breedsRepo.deleteBreed(tx, staleBreedId);
      }
    }

    const nextContext: FlockOnboardingContext = {
      ...context,
      breedGroups: nextGroups,
    };

    const [updated] = await onboardingRepo.updateUserOnboardingState(tx, userId, {
      onboardingStartedAt: existing.onboardingStartedAt ?? nowIsoString(),
      onboardingCurrentStep: getNextUnlockedStep(existing.onboardingCurrentStep, 4),
      onboardingContext: nextContext,
    });

    return {
      currentStep: updated?.onboardingCurrentStep ?? 4,
      context: nextContext,
      flockId,
    };
  }, { maxRetries: 2, operation: "Save breed groups" });
}

export async function saveFirstEggLog(userId: string, input: FirstEggLogInput) {
  const validated = firstEggLogSchema.parse(input);

  return withTransaction(async (tx) => {
    const existing = await onboardingRepo.getUserOnboardingState(tx, userId);

    if (!existing) {
      throw new Error("User not found");
    }

    const context = normalizeFlockOnboardingContext(existing.onboardingContext);
    const flockId = context.flock?.flockId || existing.defaultFlock;

    if (!flockId) {
      throw new Error("Create a flock before logging eggs");
    }

    let firstEggLog = {
      skipped: true,
    } as FlockOnboardingContext["firstEggLog"];

    if (context.firstEggLog?.logId) {
      await logsRepo.deleteLog(tx, context.firstEggLog.logId);
    }

    if (!validated.skipped) {
      const logId = createId();
      await logsRepo.createLog(tx, {
        id: logId,
        flockId,
        date: format(new Date(validated.date!), "yyyy-MM-dd"),
        count: validated.count!,
        breedId: validated.breedId || undefined,
        notes: validated.notes || undefined,
      });

      firstEggLog = {
        skipped: false,
        logId,
        date: validated.date,
        count: validated.count,
        breedId: validated.breedId || undefined,
        notes: validated.notes || "",
      };
    }

    const nextContext: FlockOnboardingContext = {
      ...context,
      firstEggLog,
    };

    const [updated] = await onboardingRepo.updateUserOnboardingState(tx, userId, {
      onboardingStartedAt: existing.onboardingStartedAt ?? nowIsoString(),
      onboardingCurrentStep: getNextUnlockedStep(existing.onboardingCurrentStep, 5),
      onboardingContext: nextContext,
    });

    return {
      currentStep: updated?.onboardingCurrentStep ?? 5,
      context: nextContext,
    };
  }, { maxRetries: 2, operation: "Save first egg log" });
}

export async function completeOnboarding(userId: string) {
  const existing = await getRequiredState(userId);
  const handoffPath = await getUserFlockLandingPath(userId);

  const [updated] = await onboardingRepo.updateUserOnboardingState(db, userId, {
    defaultFlock:
      existing.defaultFlock || existing.onboardingContext.flock?.flockId || "",
    onboardingStartedAt: existing.onboardingStartedAt ?? nowIsoString(),
    onboardingCompletedAt: nowIsoString(),
    onboardingCurrentStep: clampFlockOnboardingStep(5),
    onboardingContext: existing.onboardingContext,
  });

  return {
    completedAt: updated?.onboardingCompletedAt ?? nowIsoString(),
    handoffPath,
  };
}

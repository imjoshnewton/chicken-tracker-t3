import { user } from "@lib/db/schema-postgres";
import type { FlockOnboardingContext } from "@lib/onboarding";
import { db } from "@lib/db";
import { eq } from "drizzle-orm";

type DBOrTx = typeof db;

export async function getUserOnboardingState(dbOrTx: DBOrTx, userId: string) {
  const [record] = await dbOrTx
    .select({
      id: user.id,
      defaultFlock: user.defaultFlock,
      onboardingStartedAt: user.onboardingStartedAt,
      onboardingCompletedAt: user.onboardingCompletedAt,
      onboardingCurrentStep: user.onboardingCurrentStep,
      onboardingContext: user.onboardingContext,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return record;
}

export async function updateUserOnboardingState(
  dbOrTx: DBOrTx,
  userId: string,
  data: {
    defaultFlock?: string;
    onboardingStartedAt?: string | null;
    onboardingCompletedAt?: string | null;
    onboardingCurrentStep?: number;
    onboardingContext?: FlockOnboardingContext;
  },
) {
  return dbOrTx
    .update(user)
    .set(data)
    .where(eq(user.id, userId))
    .returning();
}

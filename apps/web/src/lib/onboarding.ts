import { z } from "zod";

export type FlockSetupIntent =
  | "starting_fresh"
  | "migrating_existing_records"
  | "backfilling_recent_activity";

export type FlockPrimaryGoal =
  | "egg_tracking"
  | "flock_organization"
  | "routine_planning";

export interface FlockWelcomeContext {
  setupIntent?: FlockSetupIntent;
  primaryGoal?: FlockPrimaryGoal;
}

export interface FlockDraftContext {
  flockId?: string;
  name?: string;
  description?: string;
  type?: string;
}

export interface FlockBreedGroupContext {
  id?: string;
  name: string;
  breed: string;
  description?: string;
  count: number;
  averageProduction: number;
}

export interface FlockEggLogContext {
  skipped?: boolean;
  logId?: string;
  date?: string;
  count?: number;
  breedId?: string;
  notes?: string;
}

export interface FlockOnboardingContext {
  welcome?: FlockWelcomeContext;
  flock?: FlockDraftContext;
  breedGroups?: FlockBreedGroupContext[];
  firstEggLog?: FlockEggLogContext;
}

export interface FlockOnboardingStepDefinition {
  step: number;
  key: string;
  title: string;
  description: string;
}

export const FLOCK_ONBOARDING_STEPS: FlockOnboardingStepDefinition[] = [
  {
    step: 1,
    key: "welcome",
    title: "Welcome",
    description: "Capture just enough setup context to tailor the handoff.",
  },
  {
    step: 2,
    key: "first-flock",
    title: "Create first flock",
    description: "Set up the first flock so the rest of onboarding has a home.",
  },
  {
    step: 3,
    key: "breed-groups",
    title: "Add breed groups",
    description: "Create the first breed groups you want to track in this flock.",
  },
  {
    step: 4,
    key: "first-egg-log",
    title: "Optional first egg log",
    description: "Add a baseline egg log now, or skip it and do it later.",
  },
  {
    step: 5,
    key: "summary",
    title: "Completion summary",
    description: "Review what is ready and hand off into the flock workspace.",
  },
];

export const FLOCK_ONBOARDING_STEP_COUNT = FLOCK_ONBOARDING_STEPS.length;
export const FLOCK_ONBOARDING_ROUTE = "/app/onboarding";

export function clampFlockOnboardingStep(step: number): number {
  return Math.min(Math.max(step, 1), FLOCK_ONBOARDING_STEP_COUNT);
}

export function isFlockOnboardingComplete(userLike: {
  onboardingCompletedAt?: string | null;
}) {
  return Boolean(userLike.onboardingCompletedAt);
}

export function getFlockOnboardingHandoffPath(userLike: {
  defaultFlock?: string | null;
}, context?: FlockOnboardingContext) {
  const flockId = context?.flock?.flockId || userLike.defaultFlock;

  if (flockId) {
    return `/app/flocks/${flockId}`;
  }

  return "/app/flocks";
}

export function normalizeFlockOnboardingContext(
  value: unknown,
): FlockOnboardingContext {
  if (!value || typeof value !== "object") {
    return {};
  }

  return value as FlockOnboardingContext;
}

export const flockWelcomeSchema = z.object({
  setupIntent: z.enum([
    "starting_fresh",
    "migrating_existing_records",
    "backfilling_recent_activity",
  ]),
  primaryGoal: z.enum([
    "egg_tracking",
    "flock_organization",
    "routine_planning",
  ]),
});

export const firstFlockSchema = z.object({
  name: z.string().trim().min(1, "Name your flock").max(120),
  description: z.string().trim().max(500).default(""),
  type: z.string().trim().min(1, "Choose a flock type").max(80),
});

export const breedGroupSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1, "Add a group name").max(120),
  breed: z.string().trim().min(1, "Add a breed").max(120),
  description: z.string().trim().max(500).default(""),
  count: z.coerce.number().int().min(1, "Count must be at least 1").max(999),
  averageProduction: z.coerce.number().min(0).max(24).default(0),
});

export const breedGroupListSchema = z.object({
  groups: z
    .array(breedGroupSchema)
    .min(1, "Add at least one breed group")
    .max(8, "Keep onboarding to 8 breed groups or fewer"),
});

export const firstEggLogSchema = z
  .object({
    skipped: z.boolean().default(false),
    date: z.string().trim().optional(),
    count: z.coerce.number().int().min(1).max(999).optional(),
    breedId: z.string().trim().optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.skipped) {
      return;
    }

    if (!value.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose a log date",
        path: ["date"],
      });
    }

    if (!value.count) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter how many eggs you collected",
        path: ["count"],
      });
    }
  });

export type FlockWelcomeInput = z.infer<typeof flockWelcomeSchema>;
export type FirstFlockInput = z.infer<typeof firstFlockSchema>;
export type BreedGroupInput = z.infer<typeof breedGroupSchema>;
export type BreedGroupListInput = z.infer<typeof breedGroupListSchema>;
export type FirstEggLogInput = z.infer<typeof firstEggLogSchema>;

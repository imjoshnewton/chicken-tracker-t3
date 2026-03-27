ALTER TABLE "flocknerd_User"
  ADD COLUMN IF NOT EXISTS "onboardingStartedAt" timestamp(3),
  ADD COLUMN IF NOT EXISTS "onboardingCompletedAt" timestamp(3),
  ADD COLUMN IF NOT EXISTS "onboardingCurrentStep" integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "onboardingContext" jsonb NOT NULL DEFAULT '{}'::jsonb;

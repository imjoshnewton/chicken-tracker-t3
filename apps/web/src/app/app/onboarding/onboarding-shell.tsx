"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  finishOnboarding,
  saveBreedGroupSetup,
  saveFirstFlockSetup,
  saveOptionalEggLog,
  saveWelcomeSetup,
} from "../../../actions/onboarding.actions";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import type { Breed, Flock } from "@lib/db/schema-postgres";
import {
  FLOCK_ONBOARDING_STEPS,
  type FlockOnboardingContext,
} from "@lib/onboarding";

type SummaryFlock = (Flock & { breeds: Breed[] }) | null;
type EditableBreedGroup = {
  id?: string;
  name: string;
  breed: string;
  description: string;
  count: number;
  averageProduction: number;
};

const flockTypeOptions = ["Backyard flock", "Layer flock", "Mixed flock"];

function StepFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-[#FEF9F6] p-6 shadow-xl lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-primary">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ErrorBanner({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

export function OnboardingShell({
  currentStep,
  unlockedStep,
  context,
  summaryFlock,
}: {
  currentStep: number;
  unlockedStep: number;
  context: FlockOnboardingContext;
  summaryFlock: SummaryFlock;
}) {
  const router = useRouter();

  const goToStep = (step: number) => {
    router.push(`/app/onboarding?step=${step}`);
    router.refresh();
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <section className="rounded-2xl bg-primary px-6 py-6 text-white shadow-xl lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
          FlockNerd onboarding
        </p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Get your first flock ready</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              This setup is intentionally lightweight: create the flock, add breed
              groups, optionally log your first eggs, then jump into tracking.
            </p>
          </div>
          <div className="text-sm text-white/80">
            Step {currentStep} of {FLOCK_ONBOARDING_STEPS.length}
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-5">
        {FLOCK_ONBOARDING_STEPS.map((step) => {
          const active = step.step === currentStep;
          const unlocked = step.step <= unlockedStep;

          return (
            <button
              key={step.step}
              type="button"
              disabled={!unlocked}
              onClick={() => goToStep(step.step)}
              className={`rounded-xl border px-4 py-4 text-left transition ${
                active
                  ? "border-primary bg-primary text-white"
                  : unlocked
                    ? "border-stone-200 bg-white text-primary hover:border-primary/50"
                    : "border-stone-200 bg-stone-100 text-stone-400"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                Step {step.step}
              </p>
              <h2 className="mt-2 text-sm font-semibold">{step.title}</h2>
            </button>
          );
        })}
      </section>

      {currentStep === 1 ? (
        <WelcomeStep context={context} onSuccess={() => goToStep(2)} />
      ) : null}
      {currentStep === 2 ? (
        <FirstFlockStep context={context} onBack={() => goToStep(1)} onSuccess={() => goToStep(3)} />
      ) : null}
      {currentStep === 3 ? (
        <BreedGroupsStep
          context={context}
          summaryFlock={summaryFlock}
          onBack={() => goToStep(2)}
          onSuccess={() => goToStep(4)}
        />
      ) : null}
      {currentStep === 4 ? (
        <FirstEggLogStep
          context={context}
          summaryFlock={summaryFlock}
          onBack={() => goToStep(3)}
          onSuccess={() => goToStep(5)}
        />
      ) : null}
      {currentStep === 5 ? (
        <CompletionStep
          context={context}
          summaryFlock={summaryFlock}
          onBack={() => goToStep(4)}
        />
      ) : null}
    </main>
  );
}

function WelcomeStep({
  context,
  onSuccess,
}: {
  context: FlockOnboardingContext;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [setupIntent, setSetupIntent] = useState(
    context.welcome?.setupIntent ?? "starting_fresh",
  );
  const [primaryGoal, setPrimaryGoal] = useState(
    context.welcome?.primaryGoal ?? "egg_tracking",
  );

  return (
    <StepFrame
      title="Welcome to your flock setup"
      description="Tell FlockNerd how you’re starting so the setup can end in the right place. This only saves basic context; it does not assume any flock health workflow."
    >
      <ErrorBanner message={error} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
          <Label>How are you getting started?</Label>
          <select
            className="h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 text-sm"
            value={setupIntent}
            onChange={(event) => setSetupIntent(event.target.value as any)}
          >
            <option value="starting_fresh">Starting fresh</option>
            <option value="migrating_existing_records">Migrating existing records</option>
            <option value="backfilling_recent_activity">Backfilling recent activity</option>
          </select>
        </div>
        <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
          <Label>What do you want ready first?</Label>
          <select
            className="h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 text-sm"
            value={primaryGoal}
            onChange={(event) => setPrimaryGoal(event.target.value as any)}
          >
            <option value="egg_tracking">Egg tracking</option>
            <option value="flock_organization">Flock organization</option>
            <option value="routine_planning">Routine planning</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await saveWelcomeSetup({ setupIntent, primaryGoal });
              if (!result.success) {
                setError(result.error);
                return;
              }
              onSuccess();
            });
          }}
        >
          {isPending ? "Saving..." : "Save and continue"}
        </Button>
      </div>
    </StepFrame>
  );
}

function FirstFlockStep({
  context,
  onBack,
  onSuccess,
}: {
  context: FlockOnboardingContext;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(context.flock?.name ?? "");
  const [description, setDescription] = useState(context.flock?.description ?? "");
  const [type, setType] = useState(context.flock?.type ?? flockTypeOptions[0]!);

  return (
    <StepFrame
      title="Create your first flock"
      description="This is the flock that the rest of onboarding will use. You can rename or expand it later in the main app."
    >
      <ErrorBanner message={error} />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="flock-name">Name your flock</Label>
          <Input
            id="flock-name"
            placeholder="Review Coop"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="flock-type">Flock type</Label>
          <select
            id="flock-type"
            className="h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 text-sm"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            {flockTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="flock-description">Description (optional)</Label>
          <Textarea
            id="flock-description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="A few notes to help you recognize this flock later"
          />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await saveFirstFlockSetup({ name, description, type });
              if (!result.success) {
                setError(result.error);
                return;
              }
              onSuccess();
            });
          }}
        >
          {isPending ? "Saving..." : "Save flock"}
        </Button>
      </div>
    </StepFrame>
  );
}

function BreedGroupsStep({
  context,
  summaryFlock,
  onBack,
  onSuccess,
}: {
  context: FlockOnboardingContext;
  summaryFlock: SummaryFlock;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const initialGroups = useMemo<EditableBreedGroup[]>(() => {
    if (context.breedGroups?.length) {
      return context.breedGroups.map((group) => ({
        id: group.id,
        name: group.name,
        breed: group.breed,
        description: group.description ?? "",
        count: group.count,
        averageProduction: group.averageProduction,
      }));
    }

    if (summaryFlock?.breeds?.length) {
      return summaryFlock.breeds.map((breed) => ({
        id: breed.id,
        name: breed.name ?? "",
        breed: breed.breed ?? "",
        description: breed.description ?? "",
        count: breed.count,
        averageProduction: breed.averageProduction,
      }));
    }

    return [
      {
        name: "",
        breed: "",
        description: "",
        count: 1,
        averageProduction: 0,
      },
    ];
  }, [context.breedGroups, summaryFlock]);
  const [groups, setGroups] = useState<EditableBreedGroup[]>(initialGroups);

  const updateGroup = (
    index: number,
    field: keyof EditableBreedGroup,
    value: string,
  ) => {
    setGroups((current) =>
      current.map((group, currentIndex) =>
        currentIndex === index
          ? {
              ...group,
              [field]:
                field === "count" || field === "averageProduction"
                  ? Number(value)
                  : value,
            }
          : group,
      ),
    );
  };

  return (
    <StepFrame
      title="Add breed groups"
      description="Set up the groups you want to track first. Keep this light; you can add more detail after onboarding."
    >
      <ErrorBanner message={error} />
      <div className="space-y-4">
        {groups.map((group, index) => (
          <div key={group.id ?? `new-${index}`} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>Group name</Label>
                <Input value={group.name} onChange={(event) => updateGroup(index, "name", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Breed</Label>
                <Input value={group.breed} onChange={(event) => updateGroup(index, "breed", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Bird count</Label>
                <Input type="number" min={1} value={group.count} onChange={(event) => updateGroup(index, "count", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Average eggs per day</Label>
                <Input type="number" min={0} step="0.1" value={group.averageProduction} onChange={(event) => updateGroup(index, "averageProduction", event.target.value)} />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label>Description</Label>
                <Textarea rows={3} value={group.description ?? ""} onChange={(event) => updateGroup(index, "description", event.target.value)} />
              </div>
            </div>
            {groups.length > 1 ? (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setGroups((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                >
                  Remove group
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-start">
        <Button
          variant="outline"
          onClick={() =>
            setGroups((current) => [
              ...current,
              {
                name: "",
                breed: "",
                description: "",
                count: 1,
                averageProduction: 0,
              },
            ])
          }
        >
          Add another group
        </Button>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await saveBreedGroupSetup({
                groups: groups.map((group) => ({
                  id: group.id,
                  name: group.name,
                  breed: group.breed,
                  description: group.description ?? "",
                  count: Number(group.count),
                  averageProduction: Number(group.averageProduction),
                })),
              });
              if (!result.success) {
                setError(result.error);
                return;
              }
              onSuccess();
            });
          }}
        >
          {isPending ? "Saving..." : "Save breed groups"}
        </Button>
      </div>
    </StepFrame>
  );
}

function FirstEggLogStep({
  context,
  summaryFlock,
  onBack,
  onSuccess,
}: {
  context: FlockOnboardingContext;
  summaryFlock: SummaryFlock;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [skipped, setSkipped] = useState(context.firstEggLog?.skipped ?? true);
  const [date, setDate] = useState(
    context.firstEggLog?.date ?? new Date().toISOString().slice(0, 10),
  );
  const [count, setCount] = useState(
    context.firstEggLog?.count ? String(context.firstEggLog.count) : "",
  );
  const [breedId, setBreedId] = useState(context.firstEggLog?.breedId ?? "");
  const [notes, setNotes] = useState(context.firstEggLog?.notes ?? "");

  return (
    <StepFrame
      title="Optional first egg log"
      description="If you already know a baseline count, log it now. Otherwise skip and start logging from the main app later."
    >
      <ErrorBanner message={error} />
      <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-4">
        <div className="flex flex-wrap gap-3">
          <Button variant={skipped ? "default" : "outline"} onClick={() => setSkipped(true)}>
            Skip for now
          </Button>
          <Button variant={!skipped ? "default" : "outline"} onClick={() => setSkipped(false)}>
            Add baseline log
          </Button>
        </div>

        {!skipped ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Log date</Label>
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Egg count</Label>
              <Input type="number" min={1} value={count} onChange={(event) => setCount(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Breed group</Label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 text-sm"
                value={breedId}
                onChange={(event) => setBreedId(event.target.value)}
              >
                <option value="">All breed groups</option>
                {summaryFlock?.breeds.map((breed) => (
                  <option key={breed.id} value={breed.id}>
                    {breed.name || breed.breed}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>Notes</Label>
              <Textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await saveOptionalEggLog({
                skipped,
                date: skipped ? undefined : date,
                count: skipped ? undefined : Number(count),
                breedId: skipped ? undefined : breedId || undefined,
                notes: skipped ? undefined : notes,
              });
              if (!result.success) {
                setError(result.error);
                return;
              }
              onSuccess();
            });
          }}
        >
          {isPending ? "Saving..." : skipped ? "Continue" : "Save egg log"}
        </Button>
      </div>
    </StepFrame>
  );
}

function CompletionStep({
  context,
  summaryFlock,
  onBack,
}: {
  context: FlockOnboardingContext;
  summaryFlock: SummaryFlock;
  onBack: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <StepFrame
      title="You’re ready to start tracking"
      description="Here’s the setup that was created in onboarding. From here, you’ll land in your flock workspace to keep adding logs, expenses, and changes over time."
    >
      <ErrorBanner message={error} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Flock</p>
          <h2 className="mt-2 text-lg font-semibold text-primary">
            {summaryFlock?.name || context.flock?.name || "Your first flock"}
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            {summaryFlock?.description || context.flock?.description || "No description added yet."}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Breed groups</p>
          <h2 className="mt-2 text-lg font-semibold text-primary">
            {summaryFlock?.breeds.length || context.breedGroups?.length || 0}
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            {summaryFlock?.breeds.length
              ? summaryFlock.breeds.map((breed) => breed.name || breed.breed).join(", ")
              : "No breed groups saved yet."}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Egg baseline</p>
          <h2 className="mt-2 text-lg font-semibold text-primary">
            {context.firstEggLog?.skipped ? "Skipped for now" : context.firstEggLog?.count ? `${context.firstEggLog.count} eggs` : "Not added"}
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            {context.firstEggLog?.skipped
              ? "You can add your first egg log from the flock detail page."
              : "This gives your first flock some initial production history."}
          </p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await finishOnboarding();
              if (!result.success) {
                setError(result.error);
                return;
              }
              router.push(result.data.handoffPath);
              router.refresh();
            });
          }}
        >
          {isPending ? "Finishing..." : "Finish onboarding"}
        </Button>
      </div>
    </StepFrame>
  );
}

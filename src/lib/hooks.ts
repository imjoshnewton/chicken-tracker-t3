import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import { number } from "zod";
import type { Flock, Breed } from "@prisma/client";

//s
// Custom hook to get user's session data
//
export function useUserData() {
  const { data, status } = useSession({
    required: true,
  });

  return {
    user: data?.user,
    defaultFlock: (data as any)?.defaultFlock,
    status,
  };
}

//
// Custom hook to get the data for the flock page: flockId, flock data (including breeds), logs and stats
//
export function useFlockData() {
  const { data } = useSession({
    required: true,
  });
  const router = useRouter();
  const { flockId, statsRange, breedFilter } = router.query;
  const range = statsRange ? Number(statsRange) : 7;

  const now = new Date(Date.now());
  now.setHours(0, 0, 0, 0);
  const today = now;

  const flockData = trpc.flocks.getFlock.useQuery(
    { flockId: flockId as string },
    {
      enabled: !!flockId && !!data?.user,
    }
  );
  const logsData = trpc.stats.getStats.useQuery(
    {
      flockId: flockId as string,
      limit: range,
      today: today,
      breedFilter: typeof breedFilter == "string" ? [breedFilter] : breedFilter,
    },
    {
      enabled: !!flockId && !!range && !!today && !!data?.user,
    }
  );
  const expenseData = trpc.stats.getExpenseStats.useQuery(
    { today: today, flockId: flockId as string },
    {
      enabled: !!flockId && !!range && !!today && !!data?.user,
    }
  );
  const breedStats = trpc.stats.getBreedStats.useQuery({
    today: today,
    flockId: flockId as string,
  });

  return {
    flockId,
    flock: flockData.data,
    stats: {
      expenses: expenseData.data,
      logs: logsData.data?.getLogs,
      lastWeekAvg: logsData.data?.lastWeeksAvg,
      thisWeekAvg: logsData.data?.thisWeeksAvg,
    },
    range,
    breedStats: breedStats.data,
    loading: flockData.isLoading && logsData.isLoading,
    error: {
      flock: flockData.error,
      stats: logsData.error,
    },
  };
}

export function useAllFlocks() {
  const { data } = useSession({ required: true });
  const flocks = trpc.flocks.getFlocks.useQuery();

  return {
    flocks: flocks.data,
    userId: data?.user?.id,
    loading: flocks.isLoading,
  };
}

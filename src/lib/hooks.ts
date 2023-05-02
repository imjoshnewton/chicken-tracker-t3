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

  const {
    data: flockData,
    error: flockError,
    isLoading: flockLoading,
  } = trpc.flocks.getFlock.useQuery(
    { flockId: flockId as string },
    {
      enabled: !!flockId && !!data?.user,
    }
  );
  const {
    data: logsData,
    error: logsError,
    isLoading: logsLoading,
  } = trpc.stats.getStats.useQuery(
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
  const {
    data: expenseData,
    isLoading: expensesLoading,
    isError: expensesError,
  } = trpc.stats.getExpenseStats.useQuery(
    { today: today, flockId: flockId as string },
    {
      enabled: !!flockId && !!range && !!today && !!data?.user,
    }
  );
  const {
    data: breedStats,
    isLoading: breedStatsLoading,
    isError: breedStatsError,
  } = trpc.stats.getBreedStats.useQuery({
    today: today,
    flockId: flockId as string,
  });

  return {
    flockId,
    flock: flockData,
    stats: {
      expenses: expenseData,
      logs: logsData?.getLogs,
      lastWeekAvg: logsData?.lastWeeksAvg,
      thisWeekAvg: logsData?.thisWeeksAvg,
    },
    range,
    breedStats: breedStats,
    loading:
      flockLoading && logsLoading && expensesLoading && breedStatsLoading,
    error: {
      flock: flockError,
      stats: logsError,
      expenses: expensesError,
      breedStats: breedStatsError,
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

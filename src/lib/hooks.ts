import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import type { Session } from "next-auth";

import { trpc } from "../utils/trpc";

//
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

//
// Custom hook to get the data for the flock page: flockId, flock data (including breeds), logs and stats
//
export function useFlockDataAppDir(
  session: Session,
  flockId: string,
  statsRange: string,
  breedFilter: string | null | undefined
) {
  const data = session;
  const range = statsRange ? Number(statsRange) : 7;

  const today = setStartOfDay(new Date());

  const flockData = useFlockQuery(flockId, data?.user);
  const logsData = useStatsQuery(
    flockId,
    range,
    today,
    breedFilter,
    data?.user
  );
  const expenseData = useExpenseStatsQuery(flockId, today, data?.user);
  const breedStats = useBreedStatsQuery(flockId, today);

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
    loading:
      flockData.isLoading &&
      logsData.isLoading &&
      expenseData.isLoading &&
      breedStats.isLoading,
    error: {
      flock: flockData.error,
      stats: logsData.error,
      expenses: expenseData.error,
      breedStats: breedStats.error,
    },
  };
}

function setStartOfDay(date: Date) {
  date.setHours(0, 0, 0, 0);
  return date;
}

function useFlockQuery(flockId: string, user: any) {
  return trpc.flocks.getFlock.useQuery(
    { flockId },
    {
      enabled: !!flockId && !!user,
    }
  );
}

function useStatsQuery(
  flockId: string,
  range: number,
  today: Date,
  breedFilter: string | null | undefined,
  user: any
) {
  return trpc.stats.getStats.useQuery(
    {
      flockId,
      limit: range,
      today,
      breedFilter: typeof breedFilter == "string" ? [breedFilter] : undefined,
    },
    {
      enabled: !!flockId && !!range && !!today && !!user,
    }
  );
}

function useExpenseStatsQuery(flockId: string, today: Date, user: any) {
  return trpc.stats.getExpenseStats.useQuery(
    { today, flockId },
    {
      enabled: !!flockId && !!today && !!user,
    }
  );
}

function useBreedStatsQuery(flockId: string, today: Date) {
  return trpc.stats.getBreedStats.useQuery({ today, flockId });
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

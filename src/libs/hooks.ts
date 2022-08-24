import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";

//
// Custom hook to get user's session data
//
export function useUserData() {
  const { data, status } = useSession({
    required: true,
  });

  return { user: data?.user, defaultFlock: data?.defaultFlock, status };
}

//
// Custom hook to get the data for the flock page: flockId, flock data (including breeds), logs and stats
//
export function useFlockData() {
  const { data } = useSession({
    required: true,
  });
  const router = useRouter();
  const { flockId, statsRange } = router.query;
  const range = statsRange ? Number(statsRange) : 7;

  const now = new Date(Date.now());
  now.setHours(0, 0, 0, 0);
  const today = now;

  const flockData = trpc.useQuery(
    ["flocks.getFlock", { flockId: flockId?.toString() }],
    {
      enabled: !!flockId && !!data?.user,
    }
  );
  const logsData = trpc.useQuery(
    [
      "stats.getStats",
      {
        flockId: flockId?.toString(),
        limit: range,
        today: today,
      },
    ],
    {
      enabled: !!flockId && !!range && !!today && !!data?.user,
    }
  );

  return {
    flockId,
    flock: flockData.data,
    stats: {
      logs: logsData.data?.getLogs,
      lastWeekAvg: logsData.data?.lastWeeksAvg,
      thisWeekAvg: logsData.data?.thisWeeksAvg,
    },
    range,
    loading: flockData.isLoading && logsData.isLoading,
    error: {
      flock: flockData.error,
      stats: logsData.error,
    },
  };
}

export function useAllFlocks() {
  const { data } = useSession({ required: true });
  const flocks = trpc.useQuery(["flocks.getFlocks"], { enabled: !!data?.user });

  return {
    flocks: flocks.data,
    userId: data?.user?.id,
    loading: flocks.isLoading,
  };
}

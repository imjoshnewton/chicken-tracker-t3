import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";

export interface BaseUser {
  id: string;
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
}

// Custom hook to read  auth record and user profile doc
export function useUserData() {
  const { data, status } = useSession({
    required: true,
  });

  return { user: data?.user, defaultFlock: data?.defaultFlock, status };
}

// Custom hook to read  auth record and user profile doc
export function useFlockData() {
  const router = useRouter();
  const { flockId, statsRange } = router.query;
  const range = statsRange ? Number(statsRange) : 7;

  const now = new Date(Date.now());
  now.setHours(0, 0, 0, 0);
  const today = now;

  const flockData = trpc.useQuery(
    ["flocks.getFlock", { flockId: flockId?.toString() }],
    {
      enabled: !!flockId,
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
      enabled: !!flockId,
    }
  );

  console.log("LogsData: ", logsData);

  return {
    flockId,
    flock: flockData.data,
    stats: {
      logs: logsData.data?.getLogs,
      lastWeekAvg: logsData.data?.lastWeeksAvg,
      thisWeekAvg: logsData.data?.thisWeeksAvg,
    },
    range,
    loading: !flockData.data,
  };
}

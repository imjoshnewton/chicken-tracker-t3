import { useUser } from "@clerk/nextjs";
import { parseISO } from "date-fns";
import { trpc } from "../utils/trpc";
import { type User } from "@lib/db/schema-postgres";
import { useEffect, useState } from "react";

//
// Custom hook to get user's session data
//
export function useUserData() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { data: user, isPending } = trpc.auth.getUser.useQuery(
    {
      clerkId: clerkUser?.id ? clerkUser.id : "",
    },
    {
      enabled: isSignedIn,
    },
  );

  // console.log("User: ", user);

  return {
    user: user as User | undefined,
    status:
      !isLoaded && isPending
        ? "loading"
        : isSignedIn && isLoaded && !isPending
        ? "authenticated"
        : null,
  };
}

//
// Custom hook to get the data for the flock page: flockId, flock data (including breeds), logs and stats
//
// export function useFlockData() {
//   const { user } = useUserData();
//   const router = useRouter();
//   const { flockId, statsRange, breedFilter } = router.query;
//   const range = {
//     from: new Date(statsRange.split(",")[0]),
//     to: new Date(statsRange.split(",")[1]),
//   };

//   const now = new Date(Date.now());
//   now.setHours(0, 0, 0, 0);
//   const today = now;

//   const {
//     data: flockData,
//     error: flockError,
//     isPending: flockLoading,
//   } = trpc.flocks.getFlock.useQuery(
//     { flockId: flockId as string },
//     {
//       enabled: !!flockId && !!user,
//     },
//   );
//   const {
//     data: logsData,
//     error: logsError,
//     isPending: logsLoading,
//   } = trpc.stats.getStats.useQuery(
//     {
//       flockId: flockId as string,
//       range,
//       today: today,
//       breedFilter: typeof breedFilter == "string" ? [breedFilter] : breedFilter,
//     },
//     {
//       enabled: !!flockId && !!range && !!today && !!user,
//     },
//   );
//   const {
//     data: expenseData,
//     isPending: expensesLoading,
//     isError: expensesError,
//   } = trpc.stats.getExpenseStats.useQuery(
//     { today: today, flockId: flockId as string },
//     {
//       enabled: !!flockId && !!range && !!today && !!user,
//     },
//   );
//   const {
//     data: breedStats,
//     isPending: breedStatsLoading,
//     isError: breedStatsError,
//   } = trpc.stats.getBreedStats.useQuery({
//     today: today,
//     flockId: flockId as string,
//   });

//   return {
//     flockId,
//     flock: flockData,
//     stats: {
//       expenses: expenseData,
//       logs: logsData?.getLogs,
//       lastWeekAvg: logsData?.lastWeeksAvg,
//       thisWeekAvg: logsData?.thisWeeksAvg,
//     },
//     range,
//     breedStats: breedStats,
//     loading:
//       flockLoading && logsLoading && expensesLoading && breedStatsLoading,
//     error: {
//       flock: flockError,
//       stats: logsError,
//       expenses: expensesError,
//       breedStats: breedStatsError,
//     },
//   };
// }

//
// Custom hook to get the data for the flock page: flockId, flock data (including breeds), logs and stats
//
export function useFlockDataAppDir(
  userId: string,
  flockId: string,
  statsRange: string,
  breedFilter: string | null | undefined,
  expenseMonths?: number,
) {
  const from = statsRange.split(",")[0];
  const to = statsRange.split(",")[1];
  const range = {
    from: parseISO(from!),
    to: parseISO(to!),
  };

  // console.log("To: ", to);
  // console.log("From: ", from);
  // console.log("Range: ", range);

  const today = setStartOfDay(new Date());

  const flockData = useFlockQuery(flockId, userId);
  const logsData = useStatsQuery(flockId, range, today, breedFilter, userId);
  const expenseData = useExpenseStatsQuery(
    flockId,
    today,
    userId,
    expenseMonths || 6,
  );
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
      flockData.isPending &&
      logsData.isPending &&
      expenseData.isPending &&
      breedStats.isPending,
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

function useFlockQuery(flockId: string, userId: string) {
  return trpc.flocks.getFlock.useQuery(
    { flockId },
    {
      enabled: !!flockId && !!userId,
    },
  );
}

function useStatsQuery(
  flockId: string,
  range: { from: Date; to: Date },
  today: Date,
  breedFilter: string | null | undefined,
  userId: string,
) {
  return trpc.stats.getStats.useQuery(
    {
      flockId,
      range,
      today,
      breedFilter: typeof breedFilter == "string" ? [breedFilter] : undefined,
    },
    {
      enabled: !!flockId && !!range && !!today && !!userId,
    },
  );
}

function useExpenseStatsQuery(
  flockId: string,
  today: Date,
  userId: string,
  numMonths: number,
) {
  return trpc.stats.getExpenseStats.useQuery(
    { today, flockId, numMonths },
    {
      enabled: !!flockId && !!today && !!userId,
    },
  );
}

function useBreedStatsQuery(flockId: string, today: Date) {
  return trpc.stats.getBreedStats.useQuery({ today, flockId });
}

export function useAllFlocks() {
  const { user } = useUserData();
  const flocks = trpc.flocks.getFlocks.useQuery();

  return {
    flocks: flocks.data,
    userId: user?.id,
    loading: flocks.isPending,
  };
}

/**
 * Custom hook for responsive design - returns true if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    
    // Add listener
    media.addEventListener("change", listener);
    
    // Clean up
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

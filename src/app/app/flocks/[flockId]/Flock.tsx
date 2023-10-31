"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import Breeds from "@components/breeds/Breeds";
import ExpenseModal from "@components/flocks/ExpenseModal";
import LogModal from "@components/flocks/LogModal";
import Stats from "@components/flocks/Stats";
import Card from "@components/shared/Card";
import Loader from "@components/shared/Loader";

import EditModal from "@components/flocks/EditModal";
import AddTaskModal from "@components/tasks/AddTaskModal";
import TaskList from "@components/tasks/Tasks";
import { Breed, Flock, Task } from "@lib/db/schema";
import { useFlockDataAppDir } from "@lib/hooks";
import { format, subDays } from "date-fns";
import { usePathname, useSearchParams } from "next/navigation";

export const runtime = "edge";

const Flock = ({ userId, flockId }: { userId: string; flockId: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = usePathname();
  const statsRange =
    searchParams?.get("statsRange") ||
    `${format(subDays(new Date(), 7), "yyyy-MM-dd")},${format(
      new Date(),
      "yyyy-MM-dd",
    )}`;
  const expenseMonths = searchParams?.get("expenseMonths")
    ? parseInt(
        searchParams.get("expenseMonths") !== null
          ? (searchParams.get("expenseMonths") as string)
          : "6",
      )
    : 6;
  const { flock, stats, range, breedStats } = useFlockDataAppDir(
    userId,
    flockId,
    statsRange,
    searchParams?.get("breedFilter"),
    expenseMonths,
  );

  const onRangeChange = useCallback(
    (event: any) => {
      const curParams = new URLSearchParams(searchParams || "");

      curParams.set("statsRange", event.target.value.toString());

      router.replace(`${path}?${curParams.toString()}`);
    },
    [router, searchParams, path],
  );

  const onMonthsChange = useCallback(
    (value: string) => {
      const curParams = new URLSearchParams(searchParams || "");

      curParams.set("expenseMonths", value.toString());

      router.replace(`${path}?${curParams.toString()}`);
    },
    [router, searchParams, path],
  );

  const clearFilter = useCallback(() => {
    const curParams = new URLSearchParams(searchParams || "");
    curParams.delete("breedFilter");

    router.replace(`${path}?${curParams.toString()}`);
  }, [router, searchParams, path]);

  const filterBreed = flock?.breeds.find(
    (breed) => breed.id == (searchParams?.get("breedFilter") as string),
  );

  if (!flock) {
    return <LoaderLayout />;
  }

  return (
    <FlockLayout
      flock={flock}
      flockId={flockId}
      onRangeChange={onRangeChange}
      onMonthsChange={onMonthsChange}
      range={range}
      clearFilter={clearFilter}
      filterText={filterBreed?.name || filterBreed?.breed}
      filterId={searchParams?.get("breedFilter") as string}
      stats={stats}
      breedStats={breedStats}
      userId={userId}
      expenseMonths={expenseMonths}
    />
  );
};

const LoaderLayout = () => (
  <main className="flex h-full min-h-[75vh] flex-col justify-center p-0 lg:p-8 lg:px-[3.5vw]">
    <div className="flex h-full items-center justify-center">
      <Loader show={true} />
    </div>
  </main>
);

const FlockLayout = ({
  flock,
  flockId,
  onRangeChange,
  onMonthsChange,
  range,
  clearFilter,
  filterText,
  filterId,
  stats,
  breedStats,
  userId,
  expenseMonths,
}: {
  flock: Flock & { breeds: Breed[]; tasks: Task[] };
  flockId: string;
  onRangeChange: (event: any) => void;
  onMonthsChange: (value: string) => void;
  range: {
    from: Date;
    to: Date;
  };
  clearFilter: () => void;
  filterText: string | undefined;
  filterId: string;
  stats: {
    expenses:
      | {
          expenses: {
            flockId: string;
            category: string;
            total: number;
            monthYear: string;
          }[];
          production: {
            flockId: string;
            total: number;
            monthYear: string;
          }[];
        }
      | undefined;
    logs:
      | {
          date: string;
          count: number;
        }[]
      | undefined;
    lastWeekAvg:
      | {
          avg: number;
        }
      | undefined;
    thisWeekAvg:
      | {
          avg: number;
        }
      | undefined;
  };
  breedStats:
    | {
        breedId: string | null;
        avgCount: number;
      }[]
    | undefined;
  userId: string;
  expenseMonths?: number;
}) => (
  <main className="flex flex-col justify-center p-0 lg:p-8 lg:px-[3.5vw]">
    <div className="shadow-xl">
      <Card title="Flock Details" className="" key={flockId?.toString()}>
        {/* <EditLink flockId={flockId} /> */}
        <FlockActions flockId={flockId?.toString()} userId={userId} />
        <FlockInfo flock={flock} flockId={flockId} />
        <TaskList tasks={flock?.tasks} flockId={flockId} userId={userId} />
        <Stats
          stats={stats}
          flock={flock}
          className="mt-4 basis-full xl:basis-[75%]"
          range={range}
          onRangeChange={onRangeChange}
          onMonthsChange={onMonthsChange}
          filter={filterText}
          filterId={filterId}
          clearFilter={clearFilter}
          expenseMonths={expenseMonths}
        />
        <Breeds
          flockId={flockId?.toString()}
          breeds={flock?.breeds}
          top={breedStats?.at(0)?.breedId}
          className="mt-4 basis-full xl:basis-[23%]"
          userId={userId}
        />
      </Card>
    </div>
  </main>
);

const FlockActions = ({
  flockId,
  userId,
}: {
  flockId: string;
  userId: string;
}) => (
  <div className="absolute right-0 top-0 mr-5 mt-3 flex self-start md:mt-2">
    <AddTaskModal userId={userId} flockId={flockId} />
    <EditModal userId={userId} flockId={flockId} />
  </div>
);

const FlockInfo = ({ flock, flockId }: any) => (
  <motion.div
    initial={{ opacity: 0, translateY: 10 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-wrap items-center"
  >
    <Image
      src={flock?.imageUrl}
      width="150"
      height="150"
      className="flock-image aspect-square object-cover"
      alt="A user uploaded image that represents this flock"
    />
    <FlockDetails flock={flock} />
    <Actions flockId={flockId} />
  </motion.div>
);

const FlockDetails = ({ flock }: any) => (
  <div className="ml-0 sm:ml-6">
    <div className="flex items-center">
      <h1 className="mr-3 dark:text-gray-300">{flock?.name}</h1>
    </div>
    <p className="description dark:text-gray-300">{flock?.description}</p>
    <p className="mt-2 text-gray-400 dark:text-gray-400">{flock?.type}</p>
  </div>
);

const Actions = ({ flockId }: any) => (
  <div className="ml-0 mt-4 flex w-full flex-wrap self-start lg:ml-auto lg:mt-0 lg:w-auto">
    <LogModal flockId={flockId?.toString()} />
    <div className="p-1"></div>
    <ExpenseModal flockId={flockId?.toString()} />
  </div>
);

export default Flock;
